'use server';

import bcrypt from 'bcryptjs';
import crypto from 'crypto';
import { AuthError } from 'next-auth';
import { getTranslations } from 'next-intl/server';
import * as z from 'zod';

import { signIn } from '@/auth';

import { verifyAltchaPayload } from '@/lib/altcha';
import { sendVerificationEmail } from '@/lib/email/resend';
import prisma from '@/lib/prisma';
import { generateVerificationToken } from '@/lib/tokens';
import { getAuthSchemas } from '@/lib/validations/auth';

export async function registerAction(formData: FormData, locale: string) {
  try {
    const t = await getTranslations('Auth.Validations');
    const tEmail = await getTranslations('Auth.EmailTemplate');
    const { RegisterSchema } = getAuthSchemas({
      invalidEmail: t('invalidEmail'),
      requiredPassword: t('requiredPassword'),
      requiredCaptcha: t('requiredCaptcha'),
      passwordMinLength: t('passwordMinLength'),
      passwordRegex: t('passwordRegex'),
      passwordsMismatch: t('passwordsMismatch'),
    });

    const data = Object.fromEntries(formData.entries());
    const validatedFields = RegisterSchema.safeParse(data);

    if (!validatedFields.success) {
      return { fieldErrors: z.flattenError(validatedFields.error).fieldErrors };
    }

    const { email, password, altcha } = validatedFields.data;

    const isHuman = await verifyAltchaPayload(altcha);
    if (!isHuman) {
      return { error: t('invalidCaptchaServer') };
    }

    const existingUser = await prisma.user.findUnique({ where: { email } });
    if (existingUser) {
      return { fieldErrors: { email: [t('emailExists')] } };
    }

    const hashedPassword = await bcrypt.hash(password, 10);

    const newUser = await prisma.user.create({
      data: {
        email,
        password: hashedPassword,
      },
    });

    const token = await generateVerificationToken(newUser.id);

    await sendVerificationEmail(email, token, locale, {
      subject: tEmail('verifySubject'),
      greeting: tEmail('greeting'),
      message: tEmail('verifyMessage'),
      button: tEmail('verifyButton'),
      ignore: tEmail('ignoreMessage'),
    });

    await signIn('credentials', { email, password, redirect: false });

    return { success: true };
  } catch (error) {
    if (error instanceof AuthError) {
      return { error: 'AuthError' };
    }
    return { error: 'ServerError' };
  }
}

export async function loginAction(formData: FormData) {
  try {
    const t = await getTranslations('Auth.Validations');
    const { LoginSchema } = getAuthSchemas({
      invalidEmail: t('invalidEmail'),
      requiredPassword: t('requiredPassword'),
      requiredCaptcha: t('requiredCaptcha'),
      passwordMinLength: '',
      passwordRegex: '',
      passwordsMismatch: '',
    });

    const data = Object.fromEntries(formData.entries());
    const validatedFields = LoginSchema.safeParse(data);

    if (!validatedFields.success) {
      return { error: t('invalidInputs') };
    }

    const { email, password, altcha } = validatedFields.data;

    const isHuman = await verifyAltchaPayload(altcha);
    if (!isHuman) {
      return { error: t('invalidCaptchaServer') };
    }

    await signIn('credentials', { email, password, redirect: false });

    return { success: true };
  } catch (error) {
    if (error instanceof AuthError) {
      switch (error.type) {
        case 'CredentialsSignin':
          return { error: 'InvalidCredentials' };
        default:
          return { error: 'AuthError' };
      }
    }
    throw error;
  }
}

export async function googleLoginAction() {
  await signIn('google', { redirectTo: '/' });
}

export async function verifyEmailTokenAction(token: string) {
  try {
    const t = await getTranslations('Auth.VerifyEmail');
    const tokenHash = crypto.createHash('sha256').update(token).digest('hex');

    const dbToken = await prisma.emailVerificationToken.findUnique({
      where: { tokenHash },
    });

    if (!dbToken) return { error: t('invalidToken') };
    if (dbToken.usedAt) return { error: t('alreadyUsed') };
    if (dbToken.expiresAt < new Date()) return { error: t('expiredToken') };

    const user = await prisma.user.findUnique({
      where: { id: dbToken.userId },
    });
    if (!user) return { error: t('userNotFound') };

    await prisma.$transaction([
      prisma.user.update({
        where: { id: user.id },
        data: { emailVerified: new Date() },
      }),
      prisma.emailVerificationToken.update({
        where: { id: dbToken.id },
        data: { usedAt: new Date() },
      }),
    ]);

    return { success: t('success') };
  } catch (error) {
    return { error: `Server error: ${error}` };
  }
}
