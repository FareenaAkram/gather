import { useRef, useState } from 'react';
import { upload } from '@vercel/blob/client';
import classes from './ImagePicker.module.css';

const ALLOWED_TYPES = ['image/jpeg', 'image/png', 'image/webp', 'image/gif'];
const MAX_SIZE = 5 * 1024 * 1024; // keep in sync with pages/api/upload.js, which enforces it

// Lets the host upload a photo (or paste a link). The uploaded image's URL is passed
// up with props.onChange, so the form only ever deals with a plain URL.
function ImagePicker(props) {
  const fileInputRef = useRef();
  const [preview, setPreview] = useState(props.value || null);
  const [progress, setProgress] = useState(null); // null when not uploading
  const [error, setError] = useState(null);
  const [isDragging, setIsDragging] = useState(false);
  const [showUrlInput, setShowUrlInput] = useState(false);

  async function uploadFile(file) {
    setError(null);

    if (!ALLOWED_TYPES.includes(file.type)) {
      setError('Please choose a JPG, PNG, WebP or GIF image.');
      return;
    }
    if (file.size > MAX_SIZE) {
      setError('That image is over 5 MB. Please choose a smaller one.');
      return;
    }

    // show the photo right away, before the upload has finished
    setPreview(URL.createObjectURL(file));
    setProgress(0);
    props.onUploadingChange(true);

    try {
      const blob = await upload(`meetups/${file.name}`, file, {
        access: 'public',
        handleUploadUrl: '/api/upload',
        onUploadProgress: (event) => setProgress(Math.round(event.percentage)),
      });
      setPreview(blob.url);
      props.onChange(blob.url);
    } catch (err) {
      setError(err.message || 'Upload failed. Please try again.');
      setPreview(props.value || null);
    } finally {
      setProgress(null);
      props.onUploadingChange(false);
    }
  }

  function fileChangeHandler(event) {
    const file = event.target.files[0];
    if (file) {
      uploadFile(file);
    }
    event.target.value = ''; // so picking the same file again still triggers a change
  }

  function dropHandler(event) {
    event.preventDefault();
    setIsDragging(false);
    const file = event.dataTransfer.files[0];
    if (file) {
      uploadFile(file);
    }
  }

  function urlChangeHandler(event) {
    setPreview(event.target.value || null);
    props.onChange(event.target.value);
  }

  const isUploading = progress !== null;

  return (
    <div>
      <div
        className={`${classes.dropzone} ${isDragging ? classes.dragging : ''} ${
          preview ? classes.hasImage : ''
        }`}
        onDragOver={(event) => {
          event.preventDefault();
          setIsDragging(true);
        }}
        onDragLeave={() => setIsDragging(false)}
        onDrop={dropHandler}
      >
        {preview && <img src={preview} alt='' className={classes.preview} />}

        <button
          type='button'
          id={props.id}
          className={classes.trigger}
          onClick={() => fileInputRef.current.click()}
          disabled={isUploading}
        >
          {isUploading ? (
            <span className={classes.status}>Uploading… {progress}%</span>
          ) : preview ? (
            <span className={classes.change}>Change photo</span>
          ) : (
            <span className={classes.empty}>
              <svg viewBox='0 0 24 24' aria-hidden='true'>
                <rect x='3' y='3' width='18' height='18' rx='4' />
                <circle cx='9' cy='9' r='2' />
                <path d='m21 15-4.5-4.5L7 20' />
              </svg>
              <strong>Drop a photo here or click to upload</strong>
              <small>JPG, PNG, WebP or GIF, up to 5 MB</small>
            </span>
          )}
        </button>

        {isUploading && (
          <div className={classes.bar}>
            <span style={{ width: `${progress}%` }} />
          </div>
        )}

        <input
          ref={fileInputRef}
          type='file'
          accept={ALLOWED_TYPES.join(',')}
          onChange={fileChangeHandler}
          hidden
        />
      </div>

      {error && (
        <p className={classes.error} role='alert'>
          {error}
        </p>
      )}

      {showUrlInput ? (
        <input
          type='url'
          className={classes.url}
          placeholder='https://…'
          defaultValue={props.value}
          onChange={urlChangeHandler}
          aria-label='Image link'
        />
      ) : (
        <button type='button' className={classes.link} onClick={() => setShowUrlInput(true)}>
          or paste an image link instead
        </button>
      )}
    </div>
  );
}

export default ImagePicker;
