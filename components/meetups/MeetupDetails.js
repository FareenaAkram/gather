import Link from 'next/link';
import classes from './MeetupDetails.module.css';

export default function MeetupDetails(props) {
  return (
    <article className={classes.details}>
      <Link href='/'>
        <a className={classes.back}>← All meetups</a>
      </Link>
      <div className={classes.cover}>
        <img src={props.image} alt={props.title} />
      </div>
      <div className={classes.body}>
        <h1>{props.title}</h1>
        <address>
          <svg viewBox='0 0 24 24' aria-hidden='true'>
            <path d='M12 21s-7-6.2-7-11.5A7 7 0 0 1 19 9.5C19 14.8 12 21 12 21Z' />
            <circle cx='12' cy='9.5' r='2.5' />
          </svg>
          {props.address}
        </address>
        <h2>About this meetup</h2>
        <p>{props.description}</p>
      </div>
    </article>
  );
}
