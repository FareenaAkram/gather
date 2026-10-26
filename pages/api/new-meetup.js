
export default function handler (req, res)  {

  if (req.method === 'POST') {
    const data = req.body;
    
    console.log(data);
    res.status(201).json({ message: 'Meetup created!' });
  }
}
