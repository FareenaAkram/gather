import StyledMap from '../ui/StyledMap';
import classes from './MeetupMap.module.css';

// Opens directions from wherever the visitor is. On phones this opens the Maps app.
function directionsUrl(props) {
  const destination = props.location
    ? `${props.location.lat},${props.location.lng}`
    : props.address;
  return `https://www.google.com/maps/dir/?api=1&destination=${encodeURIComponent(destination)}`;
}

// "Getting there" section on the details page: a map when we know where the
// meetup is, otherwise a little route drawing, plus a directions button either way.
function MeetupMap(props) {
  return (
    <section className={classes.section}>
      <div className={classes.head}>
        <h2>Getting there</h2>
        <a
          className={classes.directions}
          href={directionsUrl(props)}
          target='_blank'
          rel='noopener noreferrer'
        >
          <svg viewBox='0 0 24 24' aria-hidden='true'>
            <path d='m3 11 18-8-8 18-2-8-8-2Z' />
          </svg>
          Get directions
        </a>
      </div>

      <div className={classes.frame}>
        {props.location ? (
          <StyledMap lat={props.location.lat} lng={props.location.lng} image={props.image} />
        ) : (
          <svg className={classes.route} viewBox='0 0 400 180' aria-hidden='true'>
            <path
              className={classes.path}
              d='M60 130 C 120 130, 120 60, 190 70 S 280 140, 330 62'
            />
            <circle className={classes.you} cx='60' cy='130' r='9' />
            <text className={classes.label} x='60' y='160' textAnchor='middle'>
              You
            </text>
            <path
              className={classes.pin}
              d='M330 64s-17-15.5-17-28.5a17 17 0 0 1 34 0C347 48.5 330 64 330 64Z'
            />
            <circle cx='330' cy='35.5' r='6' fill='#fff' />
          </svg>
        )}

        <div className={classes.chip}>
          <svg viewBox='0 0 24 24' aria-hidden='true'>
            <path d='M12 21s-7-6.2-7-11.5A7 7 0 0 1 19 9.5C19 14.8 12 21 12 21Z' />
            <circle cx='12' cy='9.5' r='2.5' />
          </svg>
          <span>{props.address}</span>
        </div>
      </div>
    </section>
  );
}

export default MeetupMap;
