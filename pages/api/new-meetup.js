import { getServerSession } from 'next-auth/next';
import { authOptions } from './auth/[...nextauth]';
import { createMeetup, getAllMeetups, validateMeetup } from '../../lib/meetups';

export default async function handler(req, res) {
  if (req.method === 'POST') {
    // the page already redirects signed-out users, but the API must check too:
    // anyone can send a request straight to this URL without using our form
    const session = await getServerSession(req, res, authOptions);
    if (!session) {
      return res.status(401).json({ message: 'Please sign in to host a meetup.' });
    }

    const error = validateMeetup(req.body);
    if (error) {
      return res.status(422).json({ message: error });
    }

    const { title, image, address, description, date, category, capacity } = req.body;

    try {
      const id = await createMeetup({
        title: title.trim(),
        image: image.trim(),
        address: address.trim(),
        description: description.trim(),
        date,
        category,
        capacity: capacity ? Number(capacity) : null,
        host: {
          email: session.user.email,
          name: session.user.name || session.user.email.split('@')[0],
          image: session.user.image || null,
        },
      });
      return res.status(201).json({ message: 'Meetup created!', id });
    } catch (err) {
      console.error(err);
      return res.status(500).json({ message: 'Could not save the meetup.' });
    }
  }

  if (req.method === 'GET') {
    try {
      const meetups = await getAllMeetups();
      return res.status(200).json({ meetups });
    } catch (err) {
      console.error(err);
      return res.status(500).json({ message: 'Could not load meetups.' });
    }
  }

  res.setHeader('Allow', ['GET', 'POST']);
  return res.status(405).json({ message: `Method ${req.method} not allowed.` });
}
