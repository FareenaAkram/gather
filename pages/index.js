
import MeetupList from "../components/meetups/MeetupList";

const DUMMY_MEETUPS = [
  {
    id: 'm1',
    title: 'A First Meetup',
    image:
      'https://picsum.photos/420/630',
    address: 'Some address 5, 12345 Some City',
    description: 'This is a first meetup!',
  },
  {
    id: 'm2',
    title: 'A Second Meetup',
    image:
      'https://picsum.photos/420/630',
    address: 'Some address 10, 12345 Some City',
    description: 'This is a second meetup!',
  },
];
export default function Home() {
  return (
    <MeetupList meetups={DUMMY_MEETUPS}></MeetupList>
  )
}
