import classes from './MainNavigation.module.css';
import Link from 'next/link';
import { useRouter } from 'next/router';
import { signOut, useSession } from 'next-auth/react';
import NotificationBell from './NotificationBell';

function MainNavigation() {
  const router = useRouter();
  const { data: session, status } = useSession();

  return (
    <header className={classes.header}>
      <div className={classes.inner}>
        <Link href='/'>
          <a className={classes.logo}>
            gather<span>.</span>
          </a>
        </Link>
        <nav>
          <ul>
            <li>
              <Link href='/'>
                <a
                  className={`${classes.link} ${
                    router.pathname === '/' ? classes.active : ''
                  }`}
                >
                  All Meetups
                </a>
              </Link>
            </li>
            <li>
              <Link href='/new-meetup'>
                <a className={classes.cta}>
                  <span className={classes.plus} aria-hidden='true'>+</span>
                  <span className={classes.long}>Host a Meetup</span>
                  <span className={classes.short}>Host</span>
                </a>
              </Link>
            </li>

            {/* while NextAuth is still checking, show nothing so the nav doesn't flicker */}
            {status === 'unauthenticated' && (
              <li>
                <Link href='/signin'>
                  <a className={classes.signin}>Sign in</a>
                </Link>
              </li>
            )}
            {session && (
              <li>
                <NotificationBell />
              </li>
            )}
            {session && (
              <li className={classes.user}>
                {session.user.image ? (
                  <img
                    className={classes.avatar}
                    src={session.user.image}
                    alt=''
                    title={session.user.name || session.user.email}
                  />
                ) : (
                  <span className={classes.avatar}>
                    {(session.user.name || session.user.email)[0].toUpperCase()}
                  </span>
                )}
                <button className={classes.signout} onClick={() => signOut({ callbackUrl: '/' })}>
                  Sign out
                </button>
              </li>
            )}
          </ul>
        </nav>
      </div>
    </header>
  );
}

export default MainNavigation;
