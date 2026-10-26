import { useEffect, useState } from "react";
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
export default function Home(props) {
  const [loadedMeetups, setLoadedMeetups] = useState([]);

  useEffect(() => {
    setLoadedMeetups(DUMMY_MEETUPS), []
  })

  return (
    <MeetupList meetups={props.meetups}></MeetupList>

    
  )
}
export async function getServerSideProps(context) {
  const req = context.req;
  const res = context.res;

  // fetch data from an API
  return {
    props: {
      meetups: DUMMY_MEETUPS
    }
  }
}
  // export async function getStaticProps() {
  //     // fetch data from an API
  //     return {
  //       props: {
  //         meetups: DUMMY_MEETUPS
  //       }
  //     }
  //   } 

