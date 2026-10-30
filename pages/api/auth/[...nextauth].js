import NextAuth from 'next-auth';
import GitHubProvider from 'next-auth/providers/github';
import GoogleProvider from 'next-auth/providers/google';
import { userIdFromEmail } from '../../../lib/users';

export const authOptions = {
  providers: [
    GitHubProvider({
      clientId: process.env.GITHUB_ID,
      clientSecret: process.env.GITHUB_SECRET,
    }),
    GoogleProvider({
      clientId: process.env.GOOGLE_CLIENT_ID,
      clientSecret: process.env.GOOGLE_CLIENT_SECRET,
    }),
  ],

  // use our own pages instead of NextAuth's default ones
  pages: {
    signIn: '/signin',
    error: '/signin',
  },

  callbacks: {
    // we identify hosts by email, so refuse accounts that don't share one
    async signIn({ user }) {
      return Boolean(user.email);
    },

    // add our user id to the session so pages can tell who owns what
    async session({ session, token }) {
      if (session.user && token.email) {
        session.user.id = userIdFromEmail(token.email);
      }
      return session;
    },
  },
};

export default NextAuth(authOptions);
