import { Fragment } from "react";
import Link from "next/link";
import MeetupList from "../components/meetups/MeetupList";
import classes from "../styles/Home.module.css";
import { getUpcomingMeetups } from "../lib/meetups";
import { CATEGORIES, getCategory } from "../lib/categories";

export default function Home(props) {
  const meetups = props.meetups || [];
  const featured = meetups[0];
  const activeCategory = getCategory(props.activeCategory);
  const visibleMeetups = activeCategory
    ? meetups.filter((meetup) => meetup.category === activeCategory.id)
    : meetups;

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
            {meetups.length} {meetups.length === 1 ? 'meetup' : 'meetups'} coming up
          </div>
        </div>
      </section>

      <section id='meetups' className={classes.section}>
        <div className={classes.sectionHead}>
          <h2>Upcoming meetups</h2>
          <span className={classes.count}>
            {visibleMeetups.length} {activeCategory ? `in ${activeCategory.label}` : 'upcoming'}
          </span>
        </div>

        <nav className={classes.filters} aria-label='Filter by category'>
          <Link href='/#meetups' scroll={false}>
            <a className={`${classes.filter} ${!activeCategory ? classes.filterActive : ''}`}>
              All
            </a>
          </Link>
          {CATEGORIES.map((category) => (
            <Link
              key={category.id}
              href={`/?category=${category.id}#meetups`}
              scroll={false}
            >
              <a
                className={`${classes.filter} ${
                  activeCategory && activeCategory.id === category.id ? classes.filterActive : ''
                }`}
                style={{ '--dot': category.color }}
              >
                {category.label}
              </a>
            </Link>
          ))}
        </nav>

        <MeetupList
          meetups={visibleMeetups}
          emptyTitle={activeCategory ? `No ${activeCategory.label} meetups yet` : undefined}
        />
      </section>
    </Fragment>
  )
}

export async function getServerSideProps(context) {
  // query the database directly instead of calling our own API route over HTTP
  const meetups = await getUpcomingMeetups();
  const category = getCategory(context.query.category);

  return {
    props: {
      meetups,
      activeCategory: category ? category.id : null,
    },
  };
}
