import { useRef } from 'react';

import Card from '../ui/Card';
import classes from './NewMeetupForm.module.css';

function NewMeetupForm(props) {
  const titleInputRef = useRef();
  const imageInputRef = useRef();
  const addressInputRef = useRef();
  const descriptionInputRef = useRef();

  function submitHandler(event) {
    event.preventDefault();

    const enteredTitle = titleInputRef.current.value;
    const enteredImage = imageInputRef.current.value;
    const enteredAddress = addressInputRef.current.value;
    const enteredDescription = descriptionInputRef.current.value;

    const meetupData = {
      title: enteredTitle,
      image: enteredImage,
      address: enteredAddress,
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
            id='title'
            ref={titleInputRef}
            placeholder='e.g. Sunday Sketch Club'
          />
        </div>
        <div className={classes.control}>
          <label htmlFor='image'>Meetup Image</label>
          <input
            type='url'
            required
            id='image'
            ref={imageInputRef}
            placeholder='https://…'
          />
        </div>
        <div className={classes.control}>
          <label htmlFor='address'>Address</label>
          <input
            type='text'
            required
            id='address'
            ref={addressInputRef}
            placeholder='Street, City'
          />
        </div>
        <div className={classes.control}>
          <label htmlFor='description'>Description</label>
          <textarea
            id='description'
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
          <button disabled={props.isSubmitting}>
            {props.isSubmitting ? 'Publishing…' : 'Add Meetup'}
          </button>
        </div>
      </form>
    </Card>
  );
}

export default NewMeetupForm;
