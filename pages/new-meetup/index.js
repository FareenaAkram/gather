import NewMeetupForm from "../../components/meetups/NewMeetupForm";
import { useRouter } from "next/router";
export default function NewMeetup(onAddMeetup) {

    const router = useRouter();

    function addMeetupHandler(enteredMeetupData) {
        fetch('/api/new-meetup', {
            method: 'POST', 
            body: JSON.stringify(enteredMeetupData),
            headers: {
                'Content-Type': 'application/json'
            }
        });
        router.push('/');
    }
    return (    
        <NewMeetupForm  onAddMeetup={addMeetupHandler} />
    )
}