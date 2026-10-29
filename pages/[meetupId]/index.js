import MeetupDetails from '../../components/meetups/MeetupDetails';
export default function MeetupDetailsPage(props) {
    // const router = useRouter();
    return (
       <MeetupDetails 
        id={props.meetupData._id}
        image={props.meetupData.image}
        title={props.meetupData.title}
        address={props.meetupData.address}
        description={props.meetupData.description}
        > </MeetupDetails>
    )
}

export async function getStaticPaths() {
  const response = await fetch('http://localhost:3000/api/new-meetup');

  const data = await response.json();

  const paths = data.meetups.map((meetup) => {

    return {
      params: {
        meetupId: meetup._id.toString(),
      },
    };
  });

  return {
    fallback: false,
    paths,
  };
}


export async function getStaticProps(context) {
  const meetupId = context.params.meetupId;

  const response = await fetch('http://localhost:3000/api/new-meetup');
  const data = await response.json();

  const meetupData = data.meetups.find(
    (meetup) => meetup._id.toString() === meetupId
  );

  return {
    props: {
      meetupData: meetupData || null,
    },
  };
}
