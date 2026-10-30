import { useState } from 'react';

// A person's profile photo, or their first initial if there's no photo or it
// fails to load. referrerPolicy='no-referrer' matters: Google profile photos often
// refuse to load when the request says which website is asking for them.
function Avatar(props) {
  const [failed, setFailed] = useState(false);
  const initial = (props.name || '?')[0].toUpperCase();

  if (!props.image || failed) {
    return (
      <span className={props.className} title={props.title} aria-hidden='true'>
        {initial}
      </span>
    );
  }

  return (
    <img
      className={props.className}
      src={props.image}
      alt=''
      title={props.title}
      referrerPolicy='no-referrer'
      onError={() => setFailed(true)}
    />
  );
}

export default Avatar;
