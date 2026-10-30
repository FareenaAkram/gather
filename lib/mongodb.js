import { MongoClient } from 'mongodb';

const password = process.env.DB_PASSWORD;

if (!password) {
  throw new Error('Missing DB_PASSWORD environment variable');
}

const uri = `mongodb+srv://fareenaakram18_db_user:${password}@cluster0.nmegg5c.mongodb.net/?compressors=zlib`;

// Reuse one connection across requests (and across hot reloads in dev)
// instead of opening a new client every time.
let clientPromise;

if (process.env.NODE_ENV === 'development') {
  if (!global._mongoClientPromise) {
    global._mongoClientPromise = new MongoClient(uri).connect();
  }
  clientPromise = global._mongoClientPromise;
} else {
  clientPromise = new MongoClient(uri).connect();
}

export async function getMeetupsCollection() {
  const client = await clientPromise;
  return client.db().collection('meetups');
}
