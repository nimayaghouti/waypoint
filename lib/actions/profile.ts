'use server';

import bcrypt from 'bcryptjs';
import { getLocale, getTranslations } from 'next-intl/server';
import { revalidatePath } from 'next/cache';
import { cookies } from 'next/headers';
import * as z from 'zod';

import { auth, signIn, unstable_update } from '@/auth';

import { GOOGLE_LINK_INTENT_COOKIE } from '@/constants/auth';
import {
  deleteImageFromCloudinary,
  uploadImageToCloudinary,
} from '@/lib/cloudinary';
import { sendVerificationEmail } from '@/lib/email/resend';
import prisma from '@/lib/prisma';
import { generateVerificationToken } from '@/lib/tokens';
import { getProfileSchemas } from '@/lib/validations/profile';
import { imageFileSchema } from '@/lib/validations/shared-image';

export async function updateProfileAction(payload: {
  name: string;
  locale: string;
}) {
  try {
    const session = await auth();
    if (!session?.user?.id) return { error: 'Unauthorized' };

    const t = await getTranslations('ProfileValidations');
    const { UpdateProfileSchema } = getProfileSchemas({
      nameMin: t('nameMin'),
    });

    const validated = UpdateProfileSchema.safeParse(payload);
    if (!validated.success) return { error: 'Invalid data' };

    await prisma.user.update({
      where: { id: session.user.id },
      data: { name: validated.data.name, locale: validated.data.locale },
    });

    await unstable_update({ user: { name: validated.data.name } });

    revalidatePath('/profile');
    return { success: true };
  } catch (error) {
    console.error(error);
    return { error: 'Server error' };
  }
}

export async function uploadAvatarAction(formData: FormData) {
  try {
    const session = await auth();
    if (!session?.user?.id) return { error: 'Unauthorized' };

    const file = formData.get('file');
    const shouldRemove = formData.get('remove') === 'true';

    if (!(file instanceof File) && !shouldRemove)
      return { error: 'Invalid request' };

    const currentUser = await prisma.user.findUnique({
      where: { id: session.user.id },
      select: { imagePublicId: true },
    });

    if (file instanceof File) {
      const t = await getTranslations('ImageUpload');
      const ImageFileSchema = imageFileSchema(t('errorSize'), t('errorType'));

      const validation = ImageFileSchema.safeParse(file);
      if (!validation.success)
        return { error: validation.error.issues[0].message };

      const buffer = Buffer.from(await file.arrayBuffer());
      const uploadResult = await uploadImageToCloudinary(
        buffer,
        `avatars/${session.user.id}`,
      );

      await prisma.user.update({
        where: { id: session.user.id },
        data: { image: uploadResult.url, imagePublicId: uploadResult.publicId },
      });

      await unstable_update({ user: { image: uploadResult.url } });

      if (currentUser?.imagePublicId) {
        await deleteImageFromCloudinary(currentUser.imagePublicId);
      }

      revalidatePath('/profile');
      return { success: 'Uploaded' };
    }

    if (shouldRemove) {
      if (currentUser?.imagePublicId)
        await deleteImageFromCloudinary(currentUser.imagePublicId);

      await prisma.user.update({
        where: { id: session.user.id },
        data: { image: null, imagePublicId: null },
      });

      await unstable_update({ user: { image: null } });
      revalidatePath('/profile');
      return { success: 'Removed' };
    }
  } catch (error) {
    console.error(error);
    return { error: 'Server error' };
  }
}

export async function resendVerificationEmailAction(locale: string) {
  try {
    const session = await auth();
    if (!session?.user?.id) return { error: 'Unauthorized' };

    const t = await getTranslations('ProfileValidations');

    const user = await prisma.user.findUnique({
      where: { id: session.user.id },
    });
    if (!user) return { error: 'User not found' };
    if (user.emailVerified) return { error: t('alreadyVerified') };

    const recentToken = await prisma.emailVerificationToken.findFirst({
      where: {
        userId: user.id,
        newEmail: null,
        usedAt: null,
        expiresAt: { gt: new Date() },
      },
      orderBy: { createdAt: 'desc' },
    });
    const COOLDOWN_MS = 120 * 1000;
    if (
      recentToken &&
      Date.now() - recentToken.createdAt.getTime() < COOLDOWN_MS
    ) {
      return { error: t('cooldownActive') };
    }

    const tEmail = await getTranslations('Auth.EmailTemplate');
    const token = await generateVerificationToken(user.id);

    await sendVerificationEmail(user.email, token, locale, {
      subject: tEmail('verifySubject'),
      greeting: tEmail('greeting'),
      message: tEmail('verifyMessage'),
      button: tEmail('verifyButton'),
      ignore: tEmail('ignoreMessage'),
    });

    return { success: true };
  } catch (error) {
    console.error(error);
    return { error: 'Server error' };
  }
}

export async function requestEmailChangeAction(
  formData: FormData,
  locale: string,
) {
  try {
    const session = await auth();
    if (!session?.user?.id) return { error: 'Unauthorized' };

    const t = await getTranslations('ProfileValidations');
    const { RequestEmailChangeSchema } = getProfileSchemas({
      invalidEmail: t('invalidEmail'),
    });

    const data = Object.fromEntries(formData.entries());
    const validated = RequestEmailChangeSchema.safeParse(data);
    if (!validated.success) {
      return { fieldErrors: z.flattenError(validated.error).fieldErrors };
    }

    const { newEmail, currentPassword } = validated.data;

    const user = await prisma.user.findUnique({
      where: { id: session.user.id },
    });
    if (!user) return { error: 'User not found' };

    if (user.email === newEmail) return { error: t('sameEmail') };

    if (user.password) {
      if (!currentPassword) {
        return { fieldErrors: { currentPassword: [t('passwordRequired')] } };
      }
      const match = await bcrypt.compare(currentPassword, user.password);
      if (!match) return { error: t('invalidCurrentPass') };
    }

    const existing = await prisma.user.findUnique({
      where: { email: newEmail },
    });
    if (existing) return { error: t('emailTaken') };

    const recentChangeToken = await prisma.emailVerificationToken.findFirst({
      where: {
        userId: user.id,
        newEmail: { not: null },
        usedAt: null,
        expiresAt: { gt: new Date() },
      },
      orderBy: { createdAt: 'desc' },
    });
    const COOLDOWN_MS = 120 * 1000;
    if (
      recentChangeToken &&
      Date.now() - recentChangeToken.createdAt.getTime() < COOLDOWN_MS
    ) {
      return { error: t('cooldownActive') };
    }

    const tEmail = await getTranslations('ProfileEmailChange');
    const token = await generateVerificationToken(session.user.id, newEmail);

    await sendVerificationEmail(newEmail, token, locale, {
      subject: tEmail('subject'),
      greeting: tEmail('greeting'),
      message: tEmail('message'),
      button: tEmail('button'),
      ignore: tEmail('ignore'),
    });

    return { success: true };
  } catch (error) {
    console.error(error);
    return { error: 'Server error' };
  }
}

export async function setOrChangePasswordAction(formData: FormData) {
  try {
    const session = await auth();
    if (!session?.user?.id) return { error: 'Unauthorized' };

    const t = await getTranslations('ProfileValidations');
    const tAuth = await getTranslations('Auth.Validations');

    const user = await prisma.user.findUnique({
      where: { id: session.user.id },
    });
    if (!user) return { error: 'User not found' };

    const { UpdatePasswordSchema } = getProfileSchemas({
      passwordsMismatch: t('passwordsMismatch'),
      passwordMinLength: tAuth('passwordMinLength'),
      passwordRegex: tAuth('passwordRegex'),
    });

    const data = Object.fromEntries(formData.entries());
    const validated = UpdatePasswordSchema.safeParse(data);

    if (!validated.success) {
      return { fieldErrors: z.flattenError(validated.error).fieldErrors };
    }

    const { currentPassword, newPassword } = validated.data;

    if (user.password) {
      if (!currentPassword) return { error: 'Current password required' };
      const passwordsMatch = await bcrypt.compare(
        currentPassword,
        user.password,
      );
      if (!passwordsMatch) return { error: t('invalidCurrentPass') };
    }

    const hashedPassword = await bcrypt.hash(newPassword, 10);

    await prisma.user.update({
      where: { id: user.id },
      data: { password: hashedPassword, passwordChangedAt: new Date() },
    });

    return { success: true };
  } catch (error) {
    console.error(error);
    return { error: 'Server error' };
  }
}

export async function initiateGoogleLinkAction() {
  const session = await auth();
  if (!session?.user?.id) {
    throw new Error('UNAUTHORIZED');
  }

  const locale = await getLocale();
  const cookieStore = await cookies();
  cookieStore.set(GOOGLE_LINK_INTENT_COOKIE, `${session.user.id}:${locale}`, {
    httpOnly: true,
    secure: process.env.NODE_ENV === 'production',
    sameSite: 'lax',
    maxAge: 60 * 10,
    path: '/',
  });

  await signIn('google', { redirectTo: '/profile' });
}
