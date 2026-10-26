import MeetupDetails from '../../components/meetups/MeetupDetails';
export default function MeetupDetailsPage() {
    return (
       <MeetupDetails 
        image="https://picsum.photos/420/630"
        title="A First Meetup"
        address="Some address 5, 12345 Some City"
        description="This is a first meetup!" />
    )
}

export async function getStaticPaths() {
    return {
        fallback: false,
        paths: [    
        { params: { meetupId: 'm1' } },
        { params: { meetupId: 'm2' } }
        ]
    }
}

export async function getStaticProps(context) {
    const meetupId = context.params.meetupId;
    // fetch data for a single meetup
    return {
        props: {
            meetupData: {
                id: meetupId,
                image: 'https://picsum.photos/420/630',
                title: 'A First Meetup',
                address: 'Some address 5, 12345 Some City',
                description: 'This is a first meetup!'
            }
        }
    }
}