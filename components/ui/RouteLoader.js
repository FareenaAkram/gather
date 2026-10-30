import { useEffect, useRef, useState } from 'react';
import Router from 'next/router';
import classes from './RouteLoader.module.css';

function pathOf(url) {
  return url.split(/[?#]/)[0];
}

// Shows a progress bar while Next.js fetches the next page's data, plus a playful
// overlay when moving to a different page takes longer than a moment.
function RouteLoader() {
  const [status, setStatus] = useState('idle'); // idle | loading | done
  const [showOverlay, setShowOverlay] = useState(false);
  const overlayTimer = useRef();
  const doneTimer = useRef();

  useEffect(() => {
    function startHandler(url) {
      clearTimeout(doneTimer.current);
      clearTimeout(overlayTimer.current);
      setStatus('loading');

      // category filters stay on the same page, so they only get the slim bar
      if (pathOf(url) !== pathOf(Router.asPath)) {
        overlayTimer.current = setTimeout(() => setShowOverlay(true), 250);
      }
    }

    function finishHandler() {
      clearTimeout(overlayTimer.current);
      setShowOverlay(false);
      setStatus('done');
      doneTimer.current = setTimeout(() => setStatus('idle'), 400);
    }

    Router.events.on('routeChangeStart', startHandler);
    Router.events.on('routeChangeComplete', finishHandler);
    Router.events.on('routeChangeError', finishHandler);

    return () => {
      Router.events.off('routeChangeStart', startHandler);
      Router.events.off('routeChangeComplete', finishHandler);
      Router.events.off('routeChangeError', finishHandler);
      clearTimeout(overlayTimer.current);
      clearTimeout(doneTimer.current);
    };
  }, []);

  return (
    <>
      {status !== 'idle' && (
        <div
          className={`${classes.bar} ${status === 'done' ? classes.barDone : ''}`}
          aria-hidden='true'
        />
      )}
      {showOverlay && (
        <div className={classes.overlay} role='status' aria-live='polite'>
          <div className={classes.shapes} aria-hidden='true'>
            <span className={classes.circle} />
            <span className={classes.square} />
            <span className={classes.pill} />
          </div>
          <p>Gathering…</p>
        </div>
      )}
    </>
  );
}

export default RouteLoader;
