import { useCallback, useRef, useState } from 'react';
import { signOut } from 'next-auth/react';
import Avatar from '../ui/Avatar';
import useDismiss from '../ui/useDismiss';
import classes from './AccountMenu.module.css';

// Your avatar in the nav. Tapping it opens a small menu with your name and Sign out,
// which keeps the nav short enough for phone screens.
function AccountMenu(props) {
  const [isOpen, setIsOpen] = useState(false);
  const wrapperRef = useRef();
  const close = useCallback(() => setIsOpen(false), []);
  useDismiss(wrapperRef, isOpen, close);

  const { name, email, image } = props.user;
  const displayName = name || email;

  return (
    <div className={classes.wrapper} ref={wrapperRef}>
      <button
        className={classes.avatar}
        onClick={() => setIsOpen((open) => !open)}
        aria-label='Account menu'
        aria-expanded={isOpen}
      >
        <Avatar image={image} name={displayName} className={classes.photo} />
      </button>

      {isOpen && (
        <div className={classes.menu}>
          <div className={classes.who}>
            <strong>{displayName}</strong>
            {name && <span>{email}</span>}
          </div>
          <button className={classes.signout} onClick={() => signOut({ callbackUrl: '/' })}>
            Sign out
          </button>
        </div>
      )}
    </div>
  );
}

export default AccountMenu;
