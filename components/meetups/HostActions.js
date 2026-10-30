import { useState } from 'react';
import Link from 'next/link';
import { useRouter } from 'next/router';
import { useSession } from 'next-auth/react';
import classes from './HostActions.module.css';

// Edit and delete buttons, shown only to the person who created the meetup.
// The details page is cached and the same for everyone, so we check who is
// looking here in the browser. The API checks again before changing anything.
function HostActions(props) {
  const { data: session } = useSession();
  const router = useRouter();
  const [isConfirming, setIsConfirming] = useState(false);
  const [isDeleting, setIsDeleting] = useState(false);
  const [error, setError] = useState(null);

  if (!session || !props.host || session.user.id !== props.host.id) {
    return null;
  }

  async function deleteHandler() {
    setIsDeleting(true);
    setError(null);

    try {
      const response = await fetch('/api/meetups/' + props.meetupId, { method: 'DELETE' });
      const data = await response.json();

      if (!response.ok) {
        throw new Error(data.message || 'Something went wrong.');
      }

      router.push('/');
    } catch (err) {
      setError(err.message);
      setIsDeleting(false);
    }
  }

  return (
    <div className={classes.panel}>
      {!isConfirming ? (
        <>
          <p>You’re hosting this meetup.</p>
          <div className={classes.buttons}>
            <Link href={`/${props.meetupId}/edit`}>
              <a className={classes.edit}>Edit or reschedule</a>
            </Link>
            <button className={classes.delete} onClick={() => setIsConfirming(true)}>
              Delete
            </button>
          </div>
        </>
      ) : (
        <>
          <p>
            <strong>Delete this meetup?</strong> This can’t be undone.
          </p>
          <div className={classes.buttons}>
            <button
              className={classes.cancel}
              onClick={() => setIsConfirming(false)}
              disabled={isDeleting}
            >
              Keep it
            </button>
            <button className={classes.confirm} onClick={deleteHandler} disabled={isDeleting}>
              {isDeleting ? 'Deleting…' : 'Yes, delete'}
            </button>
          </div>
        </>
      )}
      {error && (
        <p className={classes.error} role='alert'>
          {error}
        </p>
      )}
    </div>
  );
}

export default HostActions;
