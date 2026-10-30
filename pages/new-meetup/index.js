import NewMeetupForm from "../../components/meetups/NewMeetupForm";
import { useRouter } from "next/router";
import classes from "../../styles/NewMeetup.module.css";
export default function NewMeetup(onAddMeetup) {

    const router = useRouter();

    async function addMeetupHandler(enteredMeetupData) {
        // wait for the save to finish so the new meetup shows up on the home page
        await fetch('/api/new-meetup', {
            method: 'POST',
            body: JSON.stringify(enteredMeetupData),
            headers: {
                'Content-Type': 'application/json'
            }
        });
        router.push('/');
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
            <NewMeetupForm  onAddMeetup={addMeetupHandler} />
        </section>
    )
}
