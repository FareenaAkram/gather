import Link from 'next/link';
import MeetupItem from './MeetupItem';
import classes from './MeetupList.module.css';

function MeetupList(props) {
  if (!props.meetups || props.meetups.length === 0) {
    return (
      <div className={classes.empty}>
        <h3>No meetups yet</h3>
        <p>Be the first to bring people together.</p>
        <Link href='/new-meetup'>
          <a>Host a meetup →</a>
        </Link>
      </div>
    );
  }

  return (
    <ul className={classes.list}>
      {props.meetups.map((meetup) => (
        <MeetupItem
          key={meetup._id}
          id={meetup._id}
          image={meetup.image}
          title={meetup.title}
          address={meetup.address}
        />
      ))}
    </ul>
  );
}

export default MeetupList;
