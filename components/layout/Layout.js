import Link from 'next/link';
import MainNavigation from './MainNavigation';
import RouteLoader from '../ui/RouteLoader';
import classes from './Layout.module.css';

function Layout(props) {
  return (
    <div className={classes.shell}>
      <RouteLoader />
      <MainNavigation />
      <main className={classes.main}>{props.children}</main>
      <footer className={classes.footer}>
        <div className={classes.footerInner}>
          <span className={classes.brand}>
            gather<span>.</span>
          </span>
          <p>
            Built with Next.js &amp; MongoDB ·{' '}
            <Link href='/privacy'>
              <a>Privacy</a>
            </Link>
          </p>
        </div>
      </footer>
    </div>
  );
}

export default Layout;
