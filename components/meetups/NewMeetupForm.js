import { useRef, useState } from 'react';

import Card from '../ui/Card';
import ImagePicker from './ImagePicker';
import AddressInput from './AddressInput';
import { CATEGORIES } from '../../lib/categories';
import classes from './NewMeetupForm.module.css';

// Used for both creating and editing. When editing, props.meetup fills in the fields.
function NewMeetupForm(props) {
  const meetup = props.meetup || {};
  const titleInputRef = useRef();
  // the image is state, not a ref: ImagePicker sets it once an upload finishes
  const [image, setImage] = useState(meetup.image || '');
  const [isUploading, setIsUploading] = useState(false);
  const [imageError, setImageError] = useState(null);
  const dateInputRef = useRef();
  const categoryInputRef = useRef();
  // address + coordinates come from AddressInput as you type or pick a place
  const [address, setAddress] = useState(meetup.address || '');
  const [location, setLocation] = useState(props.location || null);
  const capacityInputRef = useRef();
  const descriptionInputRef = useRef();

  function submitHandler(event) {
    event.preventDefault();

    if (!image) {
      setImageError('Please add a photo for your meetup.');
      return;
    }

    const enteredTitle = titleInputRef.current.value;
    const enteredDate = dateInputRef.current.value;
    const enteredCategory = categoryInputRef.current.value;
    const enteredCapacity = capacityInputRef.current.value;
    const enteredDescription = descriptionInputRef.current.value;

    const meetupData = {
      title: enteredTitle,
      image: image,
      date: enteredDate,
      category: enteredCategory,
      address: address,
      location: location,
      capacity: enteredCapacity ? Number(enteredCapacity) : null,
      description: enteredDescription,
    };

    props.onAddMeetup(meetupData);
  }

  return (
    <Card>
      <form className={classes.form} onSubmit={submitHandler} method="POST">
        <div className={classes.control}>
          <label htmlFor='title'>Meetup Title</label>
          <input
            type='text'
            required
            maxLength={120}
            id='title'
            defaultValue={meetup.title}
            ref={titleInputRef}
            placeholder='e.g. Sunday Sketch Club'
          />
        </div>
        <div className={classes.row}>
          <div className={classes.control}>
            <label htmlFor='date'>Date &amp; Time</label>
            <input
              type='datetime-local'
              required
              id='date'
              defaultValue={meetup.date || ''}
              ref={dateInputRef}
            />
          </div>
          <div className={classes.control}>
            <label htmlFor='category'>Category</label>
            <select id='category' required defaultValue={meetup.category || ''} ref={categoryInputRef}>
              <option value='' disabled>
                Choose one…
              </option>
              {CATEGORIES.map((category) => (
                <option key={category.id} value={category.id}>
                  {category.label}
                </option>
              ))}
            </select>
          </div>
        </div>
        <div className={classes.control}>
          <label htmlFor='image'>Meetup Image</label>
          <ImagePicker
            id='image'
            value={meetup.image}
            onChange={(url) => {
              setImage(url);
              setImageError(null);
            }}
            onUploadingChange={setIsUploading}
          />
          {imageError && (
            <p className={classes.fieldError} role='alert'>
              {imageError}
            </p>
          )}
        </div>
        <div className={classes.control}>
          <label htmlFor='address'>Address</label>
          <AddressInput
            id='address'
            defaultValue={meetup.address}
            defaultLocation={props.location}
            near={props.near}
            image={image}
            onChange={(newAddress, newLocation) => {
              setAddress(newAddress);
              setLocation(newLocation);
            }}
          />
        </div>
        <div className={`${classes.control} ${classes.narrow}`}>
          <label htmlFor='capacity'>
            Capacity <span className={classes.optional}>optional</span>
          </label>
          <input
            type='number'
            min='1'
            max='10000'
            step='1'
            id='capacity'
            defaultValue={meetup.capacity || ''}
            ref={capacityInputRef}
            placeholder='e.g. 30'
          />
        </div>
        <div className={classes.control}>
          <label htmlFor='description'>Description</label>
          <textarea
            id='description'
            defaultValue={meetup.description}
            required
            rows='5'
            placeholder='What should people expect?'
            ref={descriptionInputRef}
          ></textarea>
        </div>
        {props.error && (
          <p className={classes.error} role='alert'>
            {props.error}
          </p>
        )}
        <div className={classes.actions}>
          <button disabled={props.isSubmitting || isUploading}>
            {isUploading
              ? 'Waiting for photo…'
              : props.isSubmitting
              ? props.pendingLabel || 'Publishing…'
              : props.submitLabel || 'Add Meetup'}
          </button>
        </div>
      </form>
    </Card>
  );
}

export default NewMeetupForm;
