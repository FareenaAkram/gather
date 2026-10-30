import { Fragment } from "react";
import Link from "next/link";
import MeetupList from "../components/meetups/MeetupList";
import classes from "../styles/Home.module.css";
import { getAllMeetups } from "../lib/meetups";

export default function Home(props) {
  const meetups = props.meetups || [];
  const featured = meetups[0];

  return (
    <Fragment>
      <section className={classes.hero}>
        <div>
          <span className={classes.eyebrow}>Real people · Real places</span>
          <h1>
            Find your people.
            <br />
            Meet them <em>in real life.</em>
          </h1>
          <p className={classes.lead}>
            Discover meetups hosted by the community, or start your own in under a minute.
          </p>
          <div className={classes.heroActions}>
            <a href='#meetups' className={classes.primary}>Browse meetups</a>
            <Link href='/new-meetup'>
              <a className={classes.secondary}>Host a meetup</a>
            </Link>
          </div>
        </div>

        <div className={classes.art} aria-hidden='true'>
          <span className={`${classes.shape} ${classes.shapeA}`} />
          <span className={`${classes.shape} ${classes.shapeB}`} />
          <span className={`${classes.shape} ${classes.shapeC}`} />
          <div className={classes.photo}>
            {featured && <img src={featured.image} alt='' />}
          </div>
          <div className={classes.chip}>
            <span className={classes.dot} />
            {meetups.length} {meetups.length === 1 ? 'meetup' : 'meetups'} happening
          </div>
        </div>
      </section>

      <section id='meetups' className={classes.section}>
        <div className={classes.sectionHead}>
          <h2>Upcoming meetups</h2>
          <span className={classes.count}>{meetups.length} total</span>
        </div>
        <MeetupList meetups={meetups}></MeetupList>
      </section>
    </Fragment>
  )
}
export async function getServerSideProps() {
  // query the database directly instead of calling our own API route over HTTP
  const meetups = await getAllMeetups();

  return {
    props: { meetups },
  };
}
