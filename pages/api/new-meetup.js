
import { MongoClient } from "mongodb";
export default async function handler(req, res) {
const client = new MongoClient("mongodb+srv://fareenaakram18_db_user:lYGN84yrFvbfZp0B@cluster0.nmegg5c.mongodb.net/?compressors=zlib");
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
  
    // const client = new MongoClient("mongodb+srv://fareenaakram18_db_user:lYGN84yrFvbfZp0B@cluster0.nmegg5c.mongodb.net/?compressors=zlib");
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
