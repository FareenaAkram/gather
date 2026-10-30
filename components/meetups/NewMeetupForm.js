import { useRef } from 'react';

import Card from '../ui/Card';
import { CATEGORIES } from '../../lib/categories';
import classes from './NewMeetupForm.module.css';

function NewMeetupForm(props) {
  const titleInputRef = useRef();
  const imageInputRef = useRef();
  const dateInputRef = useRef();
  const categoryInputRef = useRef();
  const addressInputRef = useRef();
  const capacityInputRef = useRef();
  const descriptionInputRef = useRef();

  function submitHandler(event) {
    event.preventDefault();

    const enteredTitle = titleInputRef.current.value;
    const enteredImage = imageInputRef.current.value;
    const enteredDate = dateInputRef.current.value;
    const enteredCategory = categoryInputRef.current.value;
    const enteredAddress = addressInputRef.current.value;
    const enteredCapacity = capacityInputRef.current.value;
    const enteredDescription = descriptionInputRef.current.value;

    const meetupData = {
      title: enteredTitle,
      image: enteredImage,
      date: enteredDate,
      category: enteredCategory,
      address: enteredAddress,
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
            ref={titleInputRef}
            placeholder='e.g. Sunday Sketch Club'
          />
        </div>
        <div className={classes.row}>
          <div className={classes.control}>
            <label htmlFor='date'>Date &amp; Time</label>
            <input type='datetime-local' required id='date' ref={dateInputRef} />
          </div>
          <div className={classes.control}>
            <label htmlFor='category'>Category</label>
            <select id='category' required defaultValue='' ref={categoryInputRef}>
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
          <input
            type='url'
            required
            id='image'
            ref={imageInputRef}
            placeholder='https://…'
          />
        </div>
        <div className={classes.row}>
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
            <label htmlFor='capacity'>
              Capacity <span className={classes.optional}>optional</span>
            </label>
            <input
              type='number'
              min='1'
              max='10000'
              step='1'
              id='capacity'
              ref={capacityInputRef}
              placeholder='e.g. 30'
            />
          </div>
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
