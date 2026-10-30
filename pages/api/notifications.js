import { getServerSession } from 'next-auth/next';
import { authOptions } from './auth/[...nextauth]';
import { getNotifications, markAllRead } from '../../lib/notifications';

// GET   /api/notifications → your latest notifications
// PATCH /api/notifications → mark them all as read
export default async function handler(req, res) {
  if (req.method !== 'GET' && req.method !== 'PATCH') {
    res.setHeader('Allow', ['GET', 'PATCH']);
    return res.status(405).json({ message: `Method ${req.method} not allowed.` });
  }

  const session = await getServerSession(req, res, authOptions);
  if (!session) {
    return res.status(401).json({ message: 'Please sign in first.' });
  }

  const email = session.user.email.toLowerCase();

  try {
    if (req.method === 'PATCH') {
      await markAllRead(email);
      return res.status(200).json({ message: 'All caught up.' });
    }
    const notifications = await getNotifications(email);
    return res.status(200).json({ notifications });
  } catch (err) {
    console.error(err);
    return res.status(500).json({ message: 'Could not load notifications.' });
  }
}
