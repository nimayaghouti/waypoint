import { PrismaAdapter } from '@auth/prisma-adapter';
import bcrypt from 'bcryptjs';
import NextAuth from 'next-auth';
import Credentials from 'next-auth/providers/credentials';
import Google from 'next-auth/providers/google';
import { cookies } from 'next/headers';

import { GOOGLE_LINK_INTENT_COOKIE } from '@/constants/auth';
import prisma from '@/lib/prisma';
import { CoreAuthSchema } from '@/lib/validations/auth';

import { authConfig } from './auth.config';

const baseAdapter = PrismaAdapter(prisma);

export const { handlers, auth, signIn, signOut, unstable_update } = NextAuth({
  ...authConfig,

  adapter: {
    ...baseAdapter,
    linkAccount: async account => {
      const linkedAccount = await baseAdapter.linkAccount!(account);

      if (account.provider === 'google') {
        await prisma.user.update({
          where: { id: account.userId },
          data: { emailVerified: new Date() },
        });
      }

      return linkedAccount as typeof account | null | undefined;
    },
  },

  providers: [
    Google({
      clientId: process.env.AUTH_GOOGLE_ID!,
      clientSecret: process.env.AUTH_GOOGLE_SECRET!,
    }),
    Credentials({
      credentials: {
        email: { label: 'Email', type: 'email' },
        password: { label: 'Password', type: 'password' },
      },
      async authorize(credentials) {
        const validatedFields = CoreAuthSchema.safeParse(credentials);

        if (validatedFields.success) {
          const { email, password } = validatedFields.data;

          const user = await prisma.user.findUnique({
            where: { email },
          });

          if (!user || !user.password) return null;

          const passwordsMatch = await bcrypt.compare(password, user.password);

          if (passwordsMatch) return user;
        }

        return null;
      },
    }),
  ],
  callbacks: {
    ...authConfig.callbacks,
    async signIn({ account, profile }) {
      if (account?.provider !== 'google') return true;

      if (!profile?.email_verified) return false;

      const intentRaw = (await cookies()).get(GOOGLE_LINK_INTENT_COOKIE)?.value;

      if (intentRaw) {
        const [intentUserId, intentLocale] = intentRaw.split(':');
        const localePrefix = intentLocale ? `/${intentLocale}` : '';

        const currentSession = await auth();
        if (
          !currentSession?.user?.id ||
          currentSession.user.id !== intentUserId
        ) {
          return false;
        }

        const currentUserId = currentSession.user.id;

        const existingAccount = await prisma.account.findUnique({
          where: {
            provider_providerAccountId: {
              provider: 'google',
              providerAccountId: account.providerAccountId,
            },
          },
        });

        if (existingAccount) {
          return existingAccount.userId === currentUserId
            ? `${localePrefix}/profile?googleLink=already`
            : `${localePrefix}/profile?googleLink=taken`;
        }

        const currentUser = await prisma.user.findUnique({
          where: { id: currentUserId },
          select: { email: true },
        });

        if (
          !currentUser ||
          !profile.email ||
          profile.email.toLowerCase() !== currentUser.email.toLowerCase()
        ) {
          return `${localePrefix}/profile?googleLink=emailMismatch`;
        }

        await prisma.account.create({
          data: {
            userId: currentUserId,
            type: account.type,
            provider: account.provider,
            providerAccountId: account.providerAccountId,
            access_token: account.access_token,
            refresh_token: account.refresh_token,
            expires_at: account.expires_at,
            token_type: account.token_type,
            scope: account.scope,
            id_token: account.id_token,
          },
        });

        await prisma.user.updateMany({
          where: { id: currentUserId, emailVerified: null },
          data: { emailVerified: new Date() },
        });

        return `${localePrefix}/profile?googleLink=success`;
      }

      return true;
    },
  },
});
