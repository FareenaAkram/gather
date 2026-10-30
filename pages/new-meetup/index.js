import { useState } from "react";
import NewMeetupForm from "../../components/meetups/NewMeetupForm";
import { useRouter } from "next/router";
import classes from "../../styles/NewMeetup.module.css";
export default function NewMeetup() {

    const router = useRouter();
    const [isSubmitting, setIsSubmitting] = useState(false);
    const [error, setError] = useState(null);

    async function addMeetupHandler(enteredMeetupData) {
        setIsSubmitting(true);
        setError(null);

        try {
            const response = await fetch('/api/new-meetup', {
                method: 'POST',
                body: JSON.stringify(enteredMeetupData),
                headers: {
                    'Content-Type': 'application/json'
                }
            });
            const data = await response.json();

            if (!response.ok) {
                throw new Error(data.message || 'Something went wrong.');
            }

            router.push('/');
        } catch (err) {
            setError(err.message);
            setIsSubmitting(false);
        }
    }
    return (
        <section className={classes.page}>
            <div className={classes.intro}>
                <span className={classes.eyebrow}>Host a meetup</span>
                <h1>Bring your people together.</h1>
                <p>Share a few details and your meetup goes live for everyone to discover.</p>
                <ul className={classes.tips}>
                    <li>Pick a clear, specific title</li>
                    <li>Use a bright, landscape photo</li>
                    <li>Tell people what to expect</li>
                </ul>
            </div>
            <NewMeetupForm
                onAddMeetup={addMeetupHandler}
                isSubmitting={isSubmitting}
                error={error}
            />
        </section>
    )
}
