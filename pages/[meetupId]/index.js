import MeetupDetails from '../../components/meetups/MeetupDetails';
import { getMeetupById, getMeetupIds } from '../../lib/meetups';

export default function MeetupDetailsPage(props) {
  return (
    <MeetupDetails
      id={props.meetupData._id}
      image={props.meetupData.image}
      title={props.meetupData.title}
      address={props.meetupData.address}
      description={props.meetupData.description}
    />
  );
}

export async function getStaticPaths() {
  const ids = await getMeetupIds();

  return {
    // meetups added after the build are generated on their first visit
    fallback: 'blocking',
    paths: ids.map((id) => ({ params: { meetupId: id } })),
  };
}

export async function getStaticProps(context) {
  const meetupData = await getMeetupById(context.params.meetupId);

  if (!meetupData) {
    return { notFound: true, revalidate: 60 };
  }

  return {
    props: { meetupData },
    revalidate: 60,
  };
}
