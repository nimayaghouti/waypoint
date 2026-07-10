import type { NextAuthConfig } from 'next-auth';

export const authConfig = {
  session: { strategy: 'jwt' },
  pages: {
    signIn: '/login',
  },
  providers: [],
  callbacks: {
    async jwt({ token, user, trigger, session }) {
      if (user) {
        token.sub = user.id;
        token.role = user.role;
      }

      if (trigger === 'update' && session?.user) {
        if (session.user.name) token.name = session.user.name;
        if (session.user.image) token.picture = session.user.image;
      }
      return token;
    },
    async session({ session, token }) {
      if (token.sub) {
        session.user.id = token.sub;
      }
      if (token.role) {
        session.user.role = token.role as 'ADMIN' | 'USER';
      }
      return session;
    },
  },
} satisfies NextAuthConfig;
