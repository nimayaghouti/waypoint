import { PrismaAdapter } from '@auth/prisma-adapter';
import bcrypt from 'bcryptjs';
import NextAuth from 'next-auth';
import Credentials from 'next-auth/providers/credentials';
import Google from 'next-auth/providers/google';

import prisma from '@/lib/prisma';
import { CoreAuthSchema } from '@/lib/validations/auth';

import { authConfig } from './auth.config';

export const { handlers, auth, signIn, signOut, unstable_update } = NextAuth({
  ...authConfig,
  adapter: PrismaAdapter(prisma),
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
    async signIn({ user, account, profile }) {
      if (
        account?.provider === 'google' &&
        profile?.email_verified &&
        user.email
      ) {
        const existingUser = await prisma.user.findUnique({
          where: { email: user.email },
          select: {
            id: true,
            password: true,
            emailVerified: true,
            accounts: {
              select: { provider: true },
            },
          },
        });

        if (existingUser) {
          const hasGoogleAccount = existingUser.accounts.some(
            acc => acc.provider === 'google',
          );

          if (existingUser.password && !hasGoogleAccount) {
            return true;
          }

          if (!existingUser.emailVerified) {
            await prisma.user.update({
              where: { id: existingUser.id },
              data: { emailVerified: new Date() },
            });
          }
        }
      }
      return true;
    },
  },
});
