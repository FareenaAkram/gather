import { useState } from "react";
import { useRouter } from "next/router";
import { getServerSession } from "next-auth/next";
import NewMeetupForm from "../../components/meetups/NewMeetupForm";
import { authOptions } from "../api/auth/[...nextauth]";
import { getMeetupById, getMeetupLocation } from "../../lib/meetups";
import { userIdFromEmail } from "../../lib/users";
import { approximateLocation } from "../../lib/geocode";
import classes from "../../styles/NewMeetup.module.css";

export default function EditMeetup(props) {
    const router = useRouter();
    const [isSubmitting, setIsSubmitting] = useState(false);
    const [error, setError] = useState(null);

    async function updateMeetupHandler(enteredMeetupData) {
        setIsSubmitting(true);
        setError(null);

        try {
            const response = await fetch('/api/meetups/' + props.meetup._id, {
                method: 'PATCH',
                body: JSON.stringify(enteredMeetupData),
                headers: {
                    'Content-Type': 'application/json'
                }
            });
            const data = await response.json();

            if (!response.ok) {
                throw new Error(data.message || 'Something went wrong.');
            }

            // The browser keeps a copy of meetup pages it has already shown. Skip it, or
            // we'd land on the old version (old address, old map) instead of the new one.
            router.push('/' + props.meetup._id, undefined, { unstable_skipClientCache: true });
        } catch (err) {
            setError(err.message);
            setIsSubmitting(false);
        }
    }

    return (
        <section className={classes.page}>
            <div className={classes.intro}>
                <span className={classes.eyebrow}>Edit meetup</span>
                <h1>Change of plans?</h1>
                <p>Update the details or move <strong>{props.meetup.title}</strong> to a new date.</p>
                {props.meetup.attendees.length > 0 && (
                    <ul className={classes.tips}>
                        <li>
                            {props.meetup.attendees.length}{' '}
                            {props.meetup.attendees.length === 1 ? 'person is' : 'people are'} going.
                            They’ll get a notification if you change the date.
                        </li>
                    </ul>
                )}
            </div>
            <NewMeetupForm
                meetup={props.meetup}
                location={props.location}
                near={props.near}
                onAddMeetup={updateMeetupHandler}
                isSubmitting={isSubmitting}
                error={error}
                submitLabel='Save changes'
                pendingLabel='Saving…'
            />
        </section>
    )
}

// Only the host gets to see this page. Everyone else goes back to the meetup.
export async function getServerSideProps(context) {
    const { meetupId } = context.params;
    const session = await getServerSession(context.req, context.res, authOptions);

    if (!session) {
        return {
            redirect: { destination: `/signin?callbackUrl=/${meetupId}/edit`, permanent: false },
        };
    }

    const meetup = await getMeetupById(meetupId);
    if (!meetup) {
        return { notFound: true };
    }

    if (!meetup.host || meetup.host.id !== userIdFromEmail(session.user.email)) {
        return { redirect: { destination: `/${meetupId}`, permanent: false } };
    }

    const location = await getMeetupLocation(meetupId);

    // suggest places near the meetup's current spot, or near the host if it has none
    const near = location || approximateLocation(context.req);

    return { props: { meetup, location, near } };
}
