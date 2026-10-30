import { getServerSession } from 'next-auth/next';
import { authOptions } from '../auth/[...nextauth]';
import {
  checkMeetupOwner,
  cleanMeetupInput,
  deleteMeetup,
  updateMeetup,
  validateMeetup,
} from '../../../lib/meetups';

// PATCH /api/meetups/:id  → edit or reschedule a meetup
// DELETE /api/meetups/:id → delete it
// Only the meetup's host may do either.
export default async function handler(req, res) {
  if (req.method !== 'PATCH' && req.method !== 'DELETE') {
    res.setHeader('Allow', ['PATCH', 'DELETE']);
    return res.status(405).json({ message: `Method ${req.method} not allowed.` });
  }

  const session = await getServerSession(req, res, authOptions);
  if (!session) {
    return res.status(401).json({ message: 'Please sign in first.' });
  }

  const { meetupId } = req.query;

  try {
    const owner = await checkMeetupOwner(meetupId, session.user.email);
    if (owner === 'not-found') {
      return res.status(404).json({ message: 'Meetup not found.' });
    }
    if (owner === 'forbidden') {
      return res.status(403).json({ message: 'Only the host can change this meetup.' });
    }

    if (req.method === 'PATCH') {
      const error = validateMeetup(req.body);
      if (error) {
        return res.status(422).json({ message: error });
      }
      await updateMeetup(meetupId, cleanMeetupInput(req.body));
    } else {
      await deleteMeetup(meetupId);
    }
  } catch (err) {
    console.error(err);
    return res.status(500).json({ message: 'Something went wrong. Please try again.' });
  }

  // The details page is cached (ISR). Rebuild it now so the change shows up straight
  // away instead of after the 60 second revalidate window. A deleted meetup's page
  // turns into a 404.
  try {
    await res.revalidate(`/${meetupId}`);
  } catch (err) {
    console.error('Revalidation failed', err);
  }

  if (req.method === 'PATCH') {
    return res.status(200).json({ message: 'Meetup updated!' });
  }
  return res.status(200).json({ message: 'Meetup deleted.' });
}
