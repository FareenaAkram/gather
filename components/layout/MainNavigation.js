import classes from './MainNavigation.module.css';
import Link from 'next/link';
import { useRouter } from 'next/router';

function MainNavigation() {
  const router = useRouter();

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
                  <span aria-hidden='true'>+</span> Host a Meetup
                </a>
              </Link>
            </li>
          </ul>
        </nav>
      </div>
    </header>
  );
}

export default MainNavigation;
