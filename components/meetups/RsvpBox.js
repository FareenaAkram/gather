import { useEffect, useState } from 'react';
import Link from 'next/link';
import { useRouter } from 'next/router';
import { useSession } from 'next-auth/react';
import Avatar from '../ui/Avatar';
import classes from './RsvpBox.module.css';

const MAX_AVATARS = 5;

// "I'm going" button plus who else is going. The page gives us the attendee list it
// was built with; after an RSVP we switch to the fresh list the API sends back.
function RsvpBox(props) {
  const { data: session, status } = useSession();
  const router = useRouter();
  const [attendees, setAttendees] = useState(props.attendees || []);
  const [isSaving, setIsSaving] = useState(false);
  const [error, setError] = useState(null);

  // The page may be a cached copy from earlier in this visit, so ask for the
  // current list once it's on screen. Until then we show the cached one.
  useEffect(() => {
    let ignore = false;
    fetch(`/api/meetups/${props.meetupId}/rsvp`)
      .then((response) => (response.ok ? response.json() : null))
      .then((data) => {
        if (data && !ignore) {
          setAttendees(data.attendees);
        }
      })
      .catch(() => {});
    return () => {
      ignore = true;
    };
  }, [props.meetupId]);

  const userId = session && session.user.id;
  const isHost = Boolean(props.host && userId === props.host.id);
  const isGoing = attendees.some((person) => person.id === userId);
  const spotsLeft = props.capacity ? props.capacity - attendees.length : null;
  const isFull = spotsLeft !== null && spotsLeft <= 0;

  async function rsvpHandler(method) {
    setIsSaving(true);
    setError(null);

    try {
      const response = await fetch(`/api/meetups/${props.meetupId}/rsvp`, { method });
      const data = await response.json();

      if (!response.ok) {
        throw new Error(data.message || 'Something went wrong.');
      }

      setAttendees(data.attendees);
    } catch (err) {
      setError(err.message);
    } finally {
      setIsSaving(false);
    }
  }

  let action = null;
  if (status === 'loading') {
    action = null;
  } else if (!session) {
    action = (
      <Link href={`/signin?callbackUrl=${encodeURIComponent(router.asPath)}`}>
        <a className={classes.primary}>Sign in to RSVP</a>
      </Link>
    );
  } else if (isHost) {
    action = <span className={classes.note}>You’re hosting</span>;
  } else if (isGoing) {
    action = (
      <div className={classes.going}>
        <span className={classes.check}>✓ You’re going</span>
        <button
          className={classes.secondary}
          onClick={() => rsvpHandler('DELETE')}
          disabled={isSaving}
        >
          {isSaving ? 'Updating…' : 'Can’t go'}
        </button>
      </div>
    );
  } else if (isFull) {
    action = <span className={classes.note}>This meetup is full</span>;
  } else {
    action = (
      <button className={classes.primary} onClick={() => rsvpHandler('POST')} disabled={isSaving}>
        {isSaving ? 'Saving…' : 'I’m going'}
      </button>
    );
  }

  return (
    <div className={classes.box}>
      <div className={classes.people}>
        {attendees.length > 0 && (
          <div className={classes.avatars}>
            {attendees.slice(0, MAX_AVATARS).map((person) => (
              <Avatar key={person.id} image={person.image} name={person.name} title={person.name} />
            ))}
          </div>
        )}
        <div>
          <strong>
            {attendees.length === 0
              ? 'Be the first to join'
              : `${attendees.length} ${attendees.length === 1 ? 'person' : 'people'} going`}
          </strong>
          {spotsLeft !== null && (
            <span className={classes.spots}>
              {isFull ? 'No spots left' : `${spotsLeft} ${spotsLeft === 1 ? 'spot' : 'spots'} left`}
            </span>
          )}
        </div>
      </div>

      {action}

      {error && (
        <p className={classes.error} role='alert'>
          {error}
        </p>
      )}
    </div>
  );
}

export default RsvpBox;
