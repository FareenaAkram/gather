import { useCallback, useEffect, useRef, useState } from 'react';
import Link from 'next/link';
import Router from 'next/router';
import { formatShortDate } from '../../lib/dates';
import useDismiss from '../ui/useDismiss';
import classes from './NotificationBell.module.css';

function timeAgo(isoString) {
  const minutes = Math.round((Date.now() - new Date(isoString).getTime()) / 60000);
  if (minutes < 1) return 'just now';
  if (minutes < 60) return `${minutes}m ago`;
  const hours = Math.round(minutes / 60);
  if (hours < 24) return `${hours}h ago`;
  return `${Math.round(hours / 24)}d ago`;
}

// Bell icon in the nav. Only rendered for signed-in users (see MainNavigation).
function NotificationBell() {
  const [notifications, setNotifications] = useState([]);
  const [isOpen, setIsOpen] = useState(false);
  const wrapperRef = useRef();

  const unreadCount = notifications.filter((n) => !n.read).length;

  // Load notifications now, and again after every page change, so new ones show
  // up while you click around without having to reload the site.
  useEffect(() => {
    async function loadNotifications() {
      try {
        const response = await fetch('/api/notifications');
        if (response.ok) {
          const data = await response.json();
          setNotifications(data.notifications);
        }
      } catch (err) {
        // the bell is a nice extra; if it fails we just show no notifications
      }
    }

    loadNotifications();
    Router.events.on('routeChangeComplete', loadNotifications);
    return () => Router.events.off('routeChangeComplete', loadNotifications);
  }, []);

  // useCallback keeps this the same function between renders, so useDismiss
  // doesn't re-attach its listeners every time the bell re-renders
  const close = useCallback(() => {
    setIsOpen(false);
    // they've seen them now; drop the "unread" styling once the list is closed
    setNotifications((current) => current.map((n) => ({ ...n, read: true })));
  }, []);

  // close when tapping anywhere else or pressing Escape
  useDismiss(wrapperRef, isOpen, close);

  function toggleHandler() {
    if (isOpen) {
      close();
      return;
    }
    setIsOpen(true);
    if (unreadCount > 0) {
      fetch('/api/notifications', { method: 'PATCH' });
    }
  }

  return (
    <div className={classes.wrapper} ref={wrapperRef}>
      <button
        className={classes.bell}
        onClick={toggleHandler}
        aria-label={unreadCount > 0 ? `Notifications, ${unreadCount} unread` : 'Notifications'}
        aria-expanded={isOpen}
      >
        <svg viewBox='0 0 24 24' aria-hidden='true'>
          <path d='M6 8a6 6 0 1 1 12 0c0 7 3 9 3 9H3s3-2 3-9' />
          <path d='M10.3 21a1.94 1.94 0 0 0 3.4 0' />
        </svg>
        {unreadCount > 0 && <span className={classes.count}>{unreadCount}</span>}
      </button>

      {isOpen && (
        <div className={classes.panel}>
          <p className={classes.heading}>Notifications</p>

          {notifications.length === 0 ? (
            <p className={classes.empty}>
              Nothing yet. When a meetup you’re going to changes, you’ll hear about it here.
            </p>
          ) : (
            <ul>
              {notifications.map((n) => (
                <li key={n.id} className={n.read ? '' : classes.unread}>
                  {n.type === 'cancelled' ? (
                    <div className={classes.item}>
                      <p>
                        <strong>{n.meetupTitle}</strong> was cancelled by the host.
                      </p>
                      <span>{timeAgo(n.createdAt)}</span>
                    </div>
                  ) : (
                    <Link href={`/${n.meetupId}`}>
                      <a className={classes.item} onClick={() => setIsOpen(false)}>
                        <p>
                          <strong>{n.meetupTitle}</strong> moved to{' '}
                          {formatShortDate(n.newDate) || 'a new date'}
                          {n.oldDate && (
                            <span className={classes.old}> (was {formatShortDate(n.oldDate)})</span>
                          )}
                        </p>
                        <span>{timeAgo(n.createdAt)}</span>
                      </a>
                    </Link>
                  )}
                </li>
              ))}
            </ul>
          )}
        </div>
      )}
    </div>
  );
}

export default NotificationBell;
