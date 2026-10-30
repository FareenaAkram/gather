import { useState } from "react";
import { useRouter } from "next/router";
import { getServerSession } from "next-auth/next";
import NewMeetupForm from "../../components/meetups/NewMeetupForm";
import { authOptions } from "../api/auth/[...nextauth]";
import { getMeetupById } from "../../lib/meetups";
import { userIdFromEmail } from "../../lib/users";
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

            router.push('/' + props.meetup._id);
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
            </div>
            <NewMeetupForm
                meetup={props.meetup}
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

    return { props: { meetup } };
}
