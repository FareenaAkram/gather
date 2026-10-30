import { useRouter } from 'next/router';
import Card from '../ui/Card';
import classes from './MeetupItem.module.css';

function MeetupItem(props) {

  const router = useRouter();

  function showDetailsHandler() {
    // navigate to /meetupId
    router.push('/' + props.id);
  }
  return (
    <li className={classes.item}>
      <Card className={classes.card}>
        <div className={classes.image}>
          <img src={props.image} alt={props.title} />
        </div>
        <div className={classes.content}>
          <h3>{props.title}</h3>
          <address>
            <svg viewBox='0 0 24 24' aria-hidden='true'>
              <path d='M12 21s-7-6.2-7-11.5A7 7 0 0 1 19 9.5C19 14.8 12 21 12 21Z' />
              <circle cx='12' cy='9.5' r='2.5' />
            </svg>
            {props.address}
          </address>
        </div>
        <div className={classes.actions}>
          <button onClick={showDetailsHandler}>
            Show Details <span aria-hidden='true'>→</span>
          </button>
        </div>
      </Card>
    </li>
  );
}

export default MeetupItem;
