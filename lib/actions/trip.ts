'use server';

import crypto from 'crypto';
import { getTranslations } from 'next-intl/server';
import { revalidatePath } from 'next/cache';
import * as z from 'zod';

import { auth } from '@/auth';

import prisma from '@/lib/prisma';
import { getTripSchemas } from '@/lib/validations/trip';

const TRIP_LAYOUT_PATH = '/[locale]/(main)/(dashboard)/trips/[tripId]';

export async function createTripAction(formData: FormData) {
  try {
    const session = await auth();
    if (!session?.user?.id) return { error: 'Unauthorized' };

    const t = await getTranslations('TripValidations');
    const { CreateTripSchema } = getTripSchemas({
      nameMinLength: t('nameMinLength'),
      nameMaxLength: t('nameMaxLength'),
      descriptionMaxLength: t('descriptionMaxLength'),
      invalidUrl: t('invalidUrl'),
    } as Record<string, string>);

    const data = {
      name: formData.get('name') as string,
      description: formData.get('description') as string,
      coverImage: formData.get('coverImage') as string,
      timezone: formData.get('timezone') as string,
      currency: formData.get('currency') as string,
    };
    const validatedFields = CreateTripSchema.safeParse(data);

    if (!validatedFields.success) {
      return { fieldErrors: z.flattenError(validatedFields.error).fieldErrors };
    }

    const inviteCode = crypto.randomBytes(4).toString('hex').toUpperCase();

    const newTrip = await prisma.trip.create({
      data: {
        name: validatedFields.data.name,
        description: validatedFields.data.description,
        coverImage: validatedFields.data.coverImage || null,
        timezone: validatedFields.data.timezone,
        defaultCurrency: validatedFields.data.currency,
        createdById: session.user.id,
        inviteCode,
        members: {
          create: {
            userId: session.user.id,
            role: 'OWNER',
          },
        },
      },
    });

    return { success: true, tripId: newTrip.id };
  } catch (error) {
    return { error: `Server error: ${error}` };
  }
}

export async function joinTripByInviteCodeAction(inviteCode: string) {
  try {
    const session = await auth();
    if (!session?.user?.id) return { error: 'Unauthorized' };

    const trip = await prisma.trip.findUnique({
      where: { inviteCode },
      include: { members: true },
    });

    if (!trip) return { error: 'TripNotFound' };

    const isAlreadyMember = trip.members.some(
      member => member.userId === session.user?.id,
    );

    if (isAlreadyMember) {
      return { success: true, tripId: trip.id };
    }

    await prisma.tripMember.create({
      data: {
        tripId: trip.id,
        userId: session.user.id,
        role: 'EDITOR',
      },
    });

    return { success: true, tripId: trip.id };
  } catch (error) {
    return { error: `Server error: ${error}` };
  }
}

export async function updateTripSettingsAction(
  tripId: string,
  payload: { timezone: string; currency: string },
) {
  try {
    const session = await auth();
    if (!session?.user?.id) return { error: 'Unauthorized' };

    const member = await prisma.tripMember.findUnique({
      where: { tripId_userId: { tripId, userId: session.user.id } },
    });

    if (!member || member.role !== 'OWNER') {
      return { error: 'Forbidden' };
    }

    const { UpdateTripSettingsSchema } = getTripSchemas(
      {} as Record<string, string>,
    );

    const validated = UpdateTripSettingsSchema.safeParse(payload);

    if (!validated.success) {
      return {
        error: 'Invalid data',
        details: validated.error.issues,
      };
    }

    await prisma.trip.update({
      where: { id: tripId },
      data: {
        timezone: validated.data.timezone,
        defaultCurrency: validated.data.currency,
      },
    });

    revalidatePath(TRIP_LAYOUT_PATH, 'layout');

    return { success: true };
  } catch (error) {
    console.error('UPDATE TRIP SETTINGS ERROR:', error);
    return { error: 'Server error' };
  }
}

export async function updateTripInfoAction(
  tripId: string,
  payload: { name: string; description?: string; coverImage?: string },
) {
  try {
    const session = await auth();
    if (!session?.user?.id) return { error: 'Unauthorized' };

    const member = await prisma.tripMember.findUnique({
      where: { tripId_userId: { tripId, userId: session.user.id } },
    });

    if (!member || member.role !== 'OWNER') return { error: 'Forbidden' };

    const t = await getTranslations('TripValidations');
    const { UpdateTripInfoSchema } = getTripSchemas({
      nameMinLength: t('nameMinLength'),
      nameMaxLength: t('nameMaxLength'),
      descriptionMaxLength: t('descriptionMaxLength'),
      invalidUrl: t('invalidUrl'),
    } as Record<string, string>);

    const validated = UpdateTripInfoSchema.safeParse(payload);
    if (!validated.success) {
      return { fieldErrors: z.flattenError(validated.error).fieldErrors };
    }

    await prisma.trip.update({
      where: { id: tripId },
      data: {
        name: validated.data.name,
        description: validated.data.description || null,
        coverImage: validated.data.coverImage || null,
      },
    });

    revalidatePath(TRIP_LAYOUT_PATH, 'layout');
    return { success: true };
  } catch (error) {
    console.error(error);
    return { error: 'Server error' };
  }
}

export async function updateTripStatusAction(
  tripId: string,
  status: 'PLANNING' | 'CONFIRMED' | 'COMPLETED' | 'ARCHIVED',
) {
  try {
    const session = await auth();
    if (!session?.user?.id) return { error: 'Unauthorized' };

    const member = await prisma.tripMember.findUnique({
      where: { tripId_userId: { tripId, userId: session.user.id } },
    });

    if (!member || member.role !== 'OWNER') return { error: 'Forbidden' };

    const { UpdateTripStatusSchema } = getTripSchemas(
      {} as Record<string, string>,
    );
    const validated = UpdateTripStatusSchema.safeParse({ status });
    if (!validated.success) return { error: 'Invalid data' };

    await prisma.trip.update({
      where: { id: tripId },
      data: { status: validated.data.status },
    });

    revalidatePath(TRIP_LAYOUT_PATH, 'layout');
    return { success: true };
  } catch (error) {
    console.error(error);
    return { error: 'Server error' };
  }
}
