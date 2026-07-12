'use server';

import bcrypt from 'bcryptjs';
import { AuthError } from 'next-auth';
import { getTranslations } from 'next-intl/server';
import * as z from 'zod';

import { signIn } from '@/auth';

import { verifyAltchaPayload } from '@/lib/altcha';
import prisma from '@/lib/prisma';
import { getAuthSchemas } from '@/lib/validations/auth';

export async function registerAction(formData: FormData) {
  try {
    const t = await getTranslations('Auth.Validations');
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

    await prisma.user.create({
      data: {
        email,
        password: hashedPassword,
      },
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
