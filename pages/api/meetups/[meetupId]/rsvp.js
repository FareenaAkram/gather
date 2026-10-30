import { getServerSession } from 'next-auth/next';
import { authOptions } from '../../auth/[...nextauth]';
import { addAttendee, removeAttendee } from '../../../../lib/meetups';

// POST /api/meetups/:id/rsvp   → "I'm going"
// DELETE /api/meetups/:id/rsvp → "I can't go anymore"
// Responds with the updated list of attendees so the page can update right away.
export default async function handler(req, res) {
  if (req.method !== 'POST' && req.method !== 'DELETE') {
    res.setHeader('Allow', ['POST', 'DELETE']);
    return res.status(405).json({ message: `Method ${req.method} not allowed.` });
  }

  const session = await getServerSession(req, res, authOptions);
  if (!session) {
    return res.status(401).json({ message: 'Please sign in to RSVP.' });
  }

  const { meetupId } = req.query;
  const email = session.user.email.toLowerCase();

  let result;
  try {
    if (req.method === 'POST') {
      result = await addAttendee(meetupId, {
        email,
        name: session.user.name || email.split('@')[0],
        image: session.user.image || null,
      });
    } else {
      result = await removeAttendee(meetupId, email);
    }
  } catch (err) {
    console.error(err);
    return res.status(500).json({ message: 'Something went wrong. Please try again.' });
  }

  if (result.status === 'not-found') {
    return res.status(404).json({ message: 'Meetup not found.' });
  }
  if (result.status === 'host') {
    return res.status(400).json({ message: 'You’re the host, so you’re already going!' });
  }
  if (result.status === 'full') {
    return res.status(409).json({ message: 'Sorry, this meetup is full.' });
  }

  // refresh the cached details page so the attendee list is right for everyone
  try {
    await res.revalidate(`/${meetupId}`);
  } catch (err) {
    console.error('Revalidation failed', err);
  }

  return res.status(200).json({ attendees: result.attendees });
}
