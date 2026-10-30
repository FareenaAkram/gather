import { useState } from 'react';
import { signIn } from 'next-auth/react';
import { getServerSession } from 'next-auth/next';
import { authOptions } from './api/auth/[...nextauth]';
import classes from '../styles/SignIn.module.css';

const ERROR_MESSAGES = {
  AccessDenied:
    'We couldn’t get an email address from that account. On GitHub, make sure your account has a verified email.',
  default: 'Something went wrong while signing you in. Please try again.',
};

// only allow redirects back into our own site, e.g. "/new-meetup"
function safeCallbackUrl(value) {
  return typeof value === 'string' && value.startsWith('/') && !value.startsWith('//')
    ? value
    : '/';
}

export default function SignInPage(props) {
  const [pendingProvider, setPendingProvider] = useState(null);

  function signInHandler(provider) {
    setPendingProvider(provider);
    signIn(provider, { callbackUrl: props.callbackUrl });
  }

  return (
    <section className={classes.page}>
      <div className={classes.card}>
        <div className={classes.shapes} aria-hidden='true'>
          <span className={classes.circle} />
          <span className={classes.square} />
          <span className={classes.pill} />
        </div>

        <h1>Welcome to gather.</h1>
        <p className={classes.lead}>Sign in to host meetups and keep track of the ones you’re going to.</p>

        {props.error && (
          <p className={classes.error} role='alert'>
            {ERROR_MESSAGES[props.error] || ERROR_MESSAGES.default}
          </p>
        )}

        <div className={classes.buttons}>
          <button
            className={classes.github}
            onClick={() => signInHandler('github')}
            disabled={pendingProvider !== null}
          >
            <svg viewBox='0 0 24 24' aria-hidden='true'>
              <path
                fill='currentColor'
                d='M12 .5a11.5 11.5 0 0 0-3.64 22.41c.58.1.79-.25.79-.56v-2c-3.2.7-3.88-1.37-3.88-1.37-.53-1.33-1.28-1.69-1.28-1.69-1.05-.71.08-.7.08-.7 1.16.08 1.77 1.19 1.77 1.19 1.03 1.77 2.7 1.26 3.36.96.1-.75.4-1.26.73-1.55-2.55-.29-5.24-1.28-5.24-5.68 0-1.26.45-2.28 1.19-3.09-.12-.29-.52-1.46.11-3.05 0 0 .97-.31 3.17 1.18a11 11 0 0 1 5.77 0c2.2-1.49 3.17-1.18 3.17-1.18.63 1.59.23 2.76.11 3.05.74.81 1.19 1.83 1.19 3.09 0 4.41-2.69 5.38-5.26 5.67.41.36.78 1.06.78 2.14v3.17c0 .31.21.67.8.56A11.5 11.5 0 0 0 12 .5Z'
              />
            </svg>
            {pendingProvider === 'github' ? 'Redirecting…' : 'Continue with GitHub'}
          </button>

          <button
            className={classes.google}
            onClick={() => signInHandler('google')}
            disabled={pendingProvider !== null}
          >
            <svg viewBox='0 0 24 24' aria-hidden='true'>
              <path fill='#4285F4' d='M23.5 12.27c0-.85-.08-1.67-.22-2.45H12v4.64h6.45a5.5 5.5 0 0 1-2.39 3.62v3h3.86c2.26-2.09 3.58-5.16 3.58-8.81Z' />
              <path fill='#34A853' d='M12 24c3.24 0 5.95-1.07 7.93-2.92l-3.86-3c-1.08.72-2.45 1.15-4.07 1.15-3.13 0-5.78-2.11-6.73-4.95H1.28v3.1A12 12 0 0 0 12 24Z' />
              <path fill='#FBBC05' d='M5.27 14.28a7.2 7.2 0 0 1 0-4.56v-3.1H1.28a12 12 0 0 0 0 10.76l3.99-3.1Z' />
              <path fill='#EA4335' d='M12 4.77c1.76 0 3.34.61 4.59 1.8l3.43-3.43A11.5 11.5 0 0 0 12 0 12 12 0 0 0 1.28 6.62l3.99 3.1C6.22 6.88 8.87 4.77 12 4.77Z' />
            </svg>
            {pendingProvider === 'google' ? 'Redirecting…' : 'Continue with Google'}
          </button>
        </div>

        <p className={classes.note}>We only use your name, email and profile photo.</p>
      </div>
    </section>
  );
}

export async function getServerSideProps(context) {
  const callbackUrl = safeCallbackUrl(context.query.callbackUrl);
  const session = await getServerSession(context.req, context.res, authOptions);

  // already signed in? skip this page
  if (session) {
    return { redirect: { destination: callbackUrl, permanent: false } };
  }

  return {
    props: {
      callbackUrl,
      error: typeof context.query.error === 'string' ? context.query.error : null,
    },
  };
}
