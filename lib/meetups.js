import { ObjectId } from 'mongodb';
import { getMeetupsCollection } from './mongodb';
import { getCategory } from './categories';
import { parseMeetupDate, todayString } from './dates';
import { userIdFromEmail } from './users';
import { geocodeAddress } from './geocode';

// Public info about the people going: hashed id, name and photo, never emails.
export function serializeAttendees(attendees) {
  return (attendees || []).map((person) => ({
    id: userIdFromEmail(person.email),
    name: person.name,
    image: person.image || null,
  }));
}

// MongoDB's ObjectId can't be passed as a page prop, so turn it into a string.
// Meetups created before dates/categories existed get null for those fields.
function serialize(meetup) {
  return {
    _id: meetup._id.toString(),
    title: meetup.title,
    image: meetup.image,
    address: meetup.address,
    description: meetup.description,
    date: meetup.date || null,
    category: meetup.category || null,
    capacity: meetup.capacity || null,
    // never send the host's email to the browser, only the hashed id
    host: meetup.host
      ? {
          id: userIdFromEmail(meetup.host.email),
          name: meetup.host.name,
          image: meetup.host.image || null,
        }
      : null,
    attendees: serializeAttendees(meetup.attendees),
  };
}

// Soonest first; meetups without a date ("TBA") go last.
function bySoonest(a, b) {
  if (a.date && b.date) return a.date.localeCompare(b.date);
  if (a.date) return -1;
  if (b.date) return 1;
  return 0;
}

export async function getAllMeetups() {
  const collection = await getMeetupsCollection();
  const meetups = await collection.find().sort({ _id: -1 }).toArray();
  return meetups.map(serialize).sort(bySoonest);
}

// Meetups from today onwards, plus ones that don't have a date yet.
export async function getUpcomingMeetups() {
  const collection = await getMeetupsCollection();
  const meetups = await collection
    .find({
      $or: [{ date: { $gte: todayString() } }, { date: null }],
    })
    .sort({ _id: -1 })
    .toArray();
  return meetups.map(serialize).sort(bySoonest);
}

export async function getMeetupIds() {
  const collection = await getMeetupsCollection();
  const meetups = await collection.find({}, { projection: { _id: 1 } }).toArray();
  return meetups.map((meetup) => meetup._id.toString());
}

export async function getMeetupById(id) {
  if (!ObjectId.isValid(id)) {
    return null;
  }
  const collection = await getMeetupsCollection();
  const meetup = await collection.findOne({ _id: new ObjectId(id) });
  return meetup ? serialize(meetup) : null;
}

// Map coordinates for the meetup's address. Looked up the first time they're needed,
// and again only if the host changes the address, then saved, so each address is
// geocoded once rather than on every page build.
export async function getMeetupLocation(id) {
  if (!ObjectId.isValid(id)) {
    return null;
  }
  const collection = await getMeetupsCollection();
  const _id = new ObjectId(id);
  const meetup = await collection.findOne({ _id }, { projection: { address: 1, location: 1 } });
  if (!meetup) {
    return null;
  }

  const saved = meetup.location;
  if (saved && saved.address === meetup.address) {
    return saved.lat === null ? null : { lat: saved.lat, lng: saved.lng };
  }

  const coords = await geocodeAddress(meetup.address);
  if (coords === undefined) {
    return null; // lookup failed this time; don't save, so the next build tries again
  }
  await collection.updateOne(
    { _id },
    {
      $set: {
        location: {
          address: meetup.address,
          lat: coords ? coords.lat : null,
          lng: coords ? coords.lng : null,
        },
      },
    }
  );
  return coords;
}

export async function createMeetup(data) {
  const collection = await getMeetupsCollection();
  const result = await collection.insertOne(data);
  return result.insertedId.toString();
}

export async function updateMeetup(id, data) {
  const collection = await getMeetupsCollection();
  await collection.updateOne({ _id: new ObjectId(id) }, { $set: data });
}

export async function deleteMeetup(id) {
  const collection = await getMeetupsCollection();
  await collection.deleteOne({ _id: new ObjectId(id) });
}

function isSameEmail(a, b) {
  return Boolean(a && b) && a.toLowerCase() === b.toLowerCase();
}

// Can the person with this email change the meetup?
// Returns { status: 'ok', meetup } or { status: 'not-found' } or { status: 'forbidden' }.
// The meetup comes back as stored (with emails), for server-side use only.
export async function findMeetupForHost(id, email) {
  if (!ObjectId.isValid(id)) {
    return { status: 'not-found' };
  }
  const collection = await getMeetupsCollection();
  const meetup = await collection.findOne({ _id: new ObjectId(id) });
  if (!meetup) {
    return { status: 'not-found' };
  }
  // meetups created before sign-in existed have no host, so nobody can change them
  if (!meetup.host || !isSameEmail(meetup.host.email, email)) {
    return { status: 'forbidden' };
  }
  return { status: 'ok', meetup };
}

// Adds someone to the meetup's attendees. The capacity check and the insert happen
// in ONE database operation, so two people grabbing the last spot at the same time
// can't both get it.
// Returns { status: 'ok' | 'not-found' | 'host' | 'full', attendees }.
export async function addAttendee(id, person) {
  if (!ObjectId.isValid(id)) {
    return { status: 'not-found' };
  }
  const collection = await getMeetupsCollection();
  const _id = new ObjectId(id);
  const meetup = await collection.findOne({ _id });
  if (!meetup) {
    return { status: 'not-found' };
  }
  if (meetup.host && isSameEmail(meetup.host.email, person.email)) {
    return { status: 'host' };
  }

  const filter = { _id, 'attendees.email': { $ne: person.email } };
  if (meetup.capacity) {
    filter.$expr = { $lt: [{ $size: { $ifNull: ['$attendees', []] } }, meetup.capacity] };
  }
  const updated = await collection.findOneAndUpdate(
    filter,
    { $push: { attendees: person } },
    { returnDocument: 'after' }
  );

  if (updated) {
    return { status: 'ok', attendees: serializeAttendees(updated.attendees) };
  }
  // nothing matched: either they were already going (fine) or the meetup is full
  const alreadyGoing = (meetup.attendees || []).some((a) => isSameEmail(a.email, person.email));
  return alreadyGoing
    ? { status: 'ok', attendees: serializeAttendees(meetup.attendees) }
    : { status: 'full' };
}

export async function removeAttendee(id, email) {
  if (!ObjectId.isValid(id)) {
    return { status: 'not-found' };
  }
  const collection = await getMeetupsCollection();
  const updated = await collection.findOneAndUpdate(
    { _id: new ObjectId(id) },
    { $pull: { attendees: { email } } },
    { returnDocument: 'after' }
  );
  if (!updated) {
    return { status: 'not-found' };
  }
  return { status: 'ok', attendees: serializeAttendees(updated.attendees) };
}

// The fields a host is allowed to set, cleaned up. Used for both create and update,
// so a request can't sneak in extra fields like a different "host".
export function cleanMeetupInput(data) {
  const clean = {
    title: data.title.trim(),
    image: data.image.trim(),
    address: data.address.trim(),
    description: data.description.trim(),
    date: data.date,
    category: data.category,
    capacity: data.capacity ? Number(data.capacity) : null,
  };

  // Coordinates from the place search, if the host picked a suggestion. Saved with
  // the address they belong to; if they're missing, getMeetupLocation looks them up.
  if (isValidLocation(data.location)) {
    clean.location = { address: clean.address, lat: data.location.lat, lng: data.location.lng };
  }

  return clean;
}

function isValidLocation(location) {
  return (
    Boolean(location) &&
    Number.isFinite(location.lat) &&
    Number.isFinite(location.lng) &&
    Math.abs(location.lat) <= 90 &&
    Math.abs(location.lng) <= 180
  );
}

// Returns an error message, or null if the data is valid.
export function validateMeetup(data) {
  if (!data || typeof data !== 'object') {
    return 'Invalid request body.';
  }

  const fields = ['title', 'image', 'address', 'description', 'date', 'category'];
  for (const field of fields) {
    if (typeof data[field] !== 'string' || data[field].trim() === '') {
      return `"${field}" is required.`;
    }
  }

  try {
    const url = new URL(data.image);
    if (url.protocol !== 'http:' && url.protocol !== 'https:') {
      return 'Image must be an http(s) URL.';
    }
  } catch {
    return 'Image must be a valid URL.';
  }

  if (data.title.length > 120) {
    return 'Title must be 120 characters or less.';
  }

  if (!parseMeetupDate(data.date)) {
    return 'Please pick a valid date and time.';
  }

  if (data.date.slice(0, 10) < todayString()) {
    return 'The meetup date can’t be in the past.';
  }

  if (!getCategory(data.category)) {
    return 'Please pick a category.';
  }

  const hasCapacity =
    data.capacity !== undefined && data.capacity !== null && data.capacity !== '';
  if (hasCapacity) {
    const capacity = Number(data.capacity);
    if (!Number.isInteger(capacity) || capacity < 1 || capacity > 10000) {
      return 'Capacity must be a whole number between 1 and 10,000.';
    }
  }

  return null;
}
