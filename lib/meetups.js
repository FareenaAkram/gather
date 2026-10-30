import { ObjectId } from 'mongodb';
import { getMeetupsCollection } from './mongodb';
import { getCategory } from './categories';
import { parseMeetupDate, todayString } from './dates';

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

export async function createMeetup(data) {
  const collection = await getMeetupsCollection();
  const result = await collection.insertOne(data);
  return result.insertedId.toString();
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
