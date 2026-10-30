import { getNotificationsCollection } from './mongodb';

// Creates one notification per attendee. `meetup` is the meetup as stored in the
// database (with attendee emails), `type` is 'rescheduled' or 'cancelled'.
export async function notifyAttendees(meetup, type, details = {}) {
  const attendees = meetup.attendees || [];
  if (attendees.length === 0) {
    return;
  }

  const collection = await getNotificationsCollection();
  await collection.insertMany(
    attendees.map((person) => ({
      userEmail: person.email,
      type,
      meetupId: meetup._id.toString(),
      meetupTitle: meetup.title,
      oldDate: details.oldDate || null,
      newDate: details.newDate || null,
      read: false,
      createdAt: new Date(),
    }))
  );
}

export async function getNotifications(email) {
  const collection = await getNotificationsCollection();
  const notifications = await collection
    .find({ userEmail: email })
    .sort({ createdAt: -1 })
    .limit(20)
    .toArray();

  return notifications.map((n) => ({
    id: n._id.toString(),
    type: n.type,
    meetupId: n.meetupId,
    meetupTitle: n.meetupTitle,
    oldDate: n.oldDate,
    newDate: n.newDate,
    read: n.read,
    createdAt: n.createdAt.toISOString(),
  }));
}

export async function markAllRead(email) {
  const collection = await getNotificationsCollection();
  await collection.updateMany({ userEmail: email, read: false }, { $set: { read: true } });
}
