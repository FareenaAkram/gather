import { ObjectId } from 'mongodb';
import { getMeetupsCollection } from './mongodb';

// MongoDB's ObjectId can't be passed as a page prop, so turn it into a string.
function serialize(meetup) {
  return {
    _id: meetup._id.toString(),
    title: meetup.title,
    image: meetup.image,
    address: meetup.address,
    description: meetup.description,
  };
}

export async function getAllMeetups() {
  const collection = await getMeetupsCollection();
  const meetups = await collection.find().sort({ _id: -1 }).toArray();
  return meetups.map(serialize);
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

  const fields = ['title', 'image', 'address', 'description'];
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

  return null;
}
