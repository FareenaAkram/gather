import Link from 'next/link';
import classes from '../styles/Privacy.module.css';

export default function PrivacyPage() {
  return (
    <article className={classes.page}>
      <span className={classes.eyebrow}>Last updated October 30, 2026</span>
      <h1>Privacy policy</h1>
      <p className={classes.lead}>
        gather. is a small portfolio project. It collects as little as possible, and here is
        exactly what that is.
      </p>

      <h2>What we collect</h2>
      <p>
        When you sign in with GitHub or Google, we receive your <strong>name</strong>,{' '}
        <strong>email address</strong> and <strong>profile photo</strong>. We don’t ask for
        access to anything else on those accounts.
      </p>
      <p>
        If you host a meetup, we store the details you enter (title, image link, date, address,
        description, category and capacity) together with your name, email and photo.
      </p>

      <h2>How we use it</h2>
      <ul>
        <li>Your name and photo are shown as the host on meetups you create.</li>
        <li>Your email is used to recognise you as the owner of your meetups. It is never shown on the site.</li>
        <li>If you sign up for a meetup, we use your account to show you updates about it, such as a new date.</li>
      </ul>

      <h2>Cookies</h2>
      <p>
        We use one cookie to keep you signed in. There are no tracking or advertising cookies.
      </p>

      <h2>Where it’s stored</h2>
      <p>
        Data is stored in a MongoDB Atlas database, and the site is hosted on Vercel. We don’t
        sell or share your information with anyone else.
      </p>

      <h2>Deleting your data</h2>
      <p>
        You can delete any meetup you host. To have everything about you removed, open an issue on
        the project’s{' '}
        <a href='https://github.com/FareenaAkram/next-js-project/issues' target='_blank' rel='noopener noreferrer'>
          GitHub page
        </a>{' '}
        and it will be taken care of.
      </p>

      <Link href='/'>
        <a className={classes.back}>← Back to meetups</a>
      </Link>
    </article>
  );
}
