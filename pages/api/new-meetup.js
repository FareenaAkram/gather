
import { MongoClient } from "mongodb";
export default async function handler(req, res) {
  const password = process.env.DB_PASSWORD;
const client = new MongoClient(`mongodb+srv://fareenaakram18_db_user:${password}@cluster0.nmegg5c.mongodb.net/?compressors=zlib`);
  if (req.method === 'POST') {
    const data = req.body;
    
    try {
      await client.connect();
      console.log("You successfully connected to MongoDB!");
      const db = client.db();
      const meetupsCollection = db.collection('meetups');
      const result = await meetupsCollection.insertOne(data);
      console.log(result);
      await client.close();
      res.status(201).json({ message: 'Meetup created!' });

    } catch (err) {

      console.dir(err);
    }

    router.push('/');

  }
   else if (req.method === 'GET') {
  

    try {
      await client.connect();
      console.log("You successfully connected to MongoDB!");
      const db = client.db();
      const meetupsCollection = db.collection('meetups');
      const result = await meetupsCollection.find().toArray();
      console.log(result);
      await client.close();
      res.status(200).json({ meetups: result });

    } catch (err) {

      console.dir(err);
    }
    
  

  }
}
