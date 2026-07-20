'use server';

import crypto from 'crypto';
import { getTranslations } from 'next-intl/server';
import * as z from 'zod';

import { auth } from '@/auth';

import prisma from '@/lib/prisma';
import { getTripSchemas } from '@/lib/validations/trip';

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
    });

    const data = Object.fromEntries(formData.entries());
    const validatedFields = CreateTripSchema.safeParse(data);

    if (!validatedFields.success) {
      return { fieldErrors: z.flattenError(validatedFields.error).fieldErrors };
    }

    const { name, description } = validatedFields.data;

    const inviteCode = crypto.randomBytes(4).toString('hex').toUpperCase();

    const newTrip = await prisma.trip.create({
      data: {
        name,
        description,
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
