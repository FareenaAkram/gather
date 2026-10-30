import { createHash } from 'crypto';

// A short, stable id for a person, made from their email. People can sign in with
// GitHub or Google, and the email is the one thing both have in common. We hash it
// so the public pages can say "this meetup belongs to user X" without showing the
// host's email address to everyone.
export function userIdFromEmail(email) {
  return createHash('sha256').update(email.trim().toLowerCase()).digest('hex').slice(0, 24);
}
