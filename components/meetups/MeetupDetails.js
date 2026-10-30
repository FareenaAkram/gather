import Link from 'next/link';
import HostActions from './HostActions';
import { getCategory } from '../../lib/categories';
import { formatLongDate, googleCalendarUrl } from '../../lib/dates';
import classes from './MeetupDetails.module.css';

export default function MeetupDetails(props) {
  const category = getCategory(props.category);
  const when = formatLongDate(props.date);
  const calendarUrl = googleCalendarUrl(props);

  return (
    <article className={classes.details}>
      <Link href='/'>
        <a className={classes.back}>← All meetups</a>
      </Link>
      <div className={classes.cover}>
        <img src={props.image} alt={props.title} />
      </div>
      <div className={classes.body}>
        {category && (
          <span className={classes.category} style={{ '--dot': category.color }}>
            {category.label}
          </span>
        )}
        <h1>{props.title}</h1>

        {props.host && (
          <div className={classes.host}>
            {props.host.image ? (
              <img src={props.host.image} alt='' />
            ) : (
              <span>{props.host.name[0].toUpperCase()}</span>
            )}
            <p>
              Hosted by <strong>{props.host.name}</strong>
            </p>
          </div>
        )}

        <HostActions meetupId={props.id} host={props.host} />

        <div className={classes.info}>
          <div className={classes.tile}>
            <div className={classes.icon}>
              <svg viewBox='0 0 24 24' aria-hidden='true'>
                <rect x='3.5' y='5' width='17' height='15' rx='3' />
                <path d='M3.5 10h17M8 3v4M16 3v4' />
              </svg>
            </div>
            <div>
              <strong>{when ? when.date : 'Date TBA'}</strong>
              <span>{when ? when.time : 'The host hasn’t set a time yet'}</span>
            </div>
          </div>

          <div className={classes.tile}>
            <div className={classes.icon}>
              <svg viewBox='0 0 24 24' aria-hidden='true'>
                <path d='M12 21s-7-6.2-7-11.5A7 7 0 0 1 19 9.5C19 14.8 12 21 12 21Z' />
                <circle cx='12' cy='9.5' r='2.5' />
              </svg>
            </div>
            <div>
              <address>{props.address}</address>
              <span>In person</span>
            </div>
          </div>

          {props.capacity && (
            <div className={classes.tile}>
              <div className={classes.icon}>
                <svg viewBox='0 0 24 24' aria-hidden='true'>
                  <circle cx='9' cy='8' r='3.5' />
                  <path d='M2.5 20c0-3.6 2.9-6 6.5-6s6.5 2.4 6.5 6' />
                  <path d='M16 4.7a3.5 3.5 0 0 1 0 6.6M18.5 14.4c1.8.8 3 2.9 3 5.6' />
                </svg>
              </div>
              <div>
                <strong>Up to {props.capacity} people</strong>
                <span>Limited spots</span>
              </div>
            </div>
          )}
        </div>

        {calendarUrl && (
          <a
            className={classes.calendar}
            href={calendarUrl}
            target='_blank'
            rel='noopener noreferrer'
          >
            + Add to Google Calendar
          </a>
        )}

        <h2>About this meetup</h2>
        <p>{props.description}</p>
      </div>
    </article>
  );
}
