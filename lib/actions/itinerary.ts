'use server';

import { getTranslations } from 'next-intl/server';
import { revalidatePath } from 'next/cache';
import * as z from 'zod';

import { auth } from '@/auth';

import prisma from '@/lib/prisma';
import { getItinerarySchemas } from '@/lib/validations/itinerary';

const ITINERARY_PATH = '/[locale]/(main)/(dashboard)/trips/[tripId]/itinerary';

async function verifyEditorAccess(tripId: string) {
  const session = await auth();
  if (!session?.user?.id) return { error: 'Unauthorized' };

  const member = await prisma.tripMember.findUnique({
    where: { tripId_userId: { tripId, userId: session.user.id } },
  });

  if (!member || member.role === 'VIEWER') return { error: 'Forbidden' };
  return { success: true };
}

export async function addItineraryDayAction(
  tripId: string,
  dateString: string,
) {
  try {
    const authCheck = await verifyEditorAccess(tripId);
    if (authCheck.error) return authCheck;

    const t = await getTranslations('ItineraryValidations');
    const { AddDaySchema } = getItinerarySchemas({
      dateRequired: t('dateRequired'),
    } as Record<string, string>);

    const validatedFields = AddDaySchema.safeParse({ date: dateString });
    if (!validatedFields.success) return { error: t('dateRequired') };

    const targetDate = new Date(`${dateString}T12:00:00Z`);

    const existingDay = await prisma.itineraryDay.findUnique({
      where: { tripId_date: { tripId, date: targetDate } },
    });

    if (existingDay) return { error: t('dateAlreadyExists') };

    await prisma.itineraryDay.create({
      data: { tripId, date: targetDate },
    });

    revalidatePath(ITINERARY_PATH, 'page');
    return { success: true };
  } catch (error) {
    console.error(error);
    return { error: 'Server error' };
  }
}

export async function deleteItineraryDayAction(tripId: string, dayId: string) {
  try {
    const authCheck = await verifyEditorAccess(tripId);
    if (authCheck.error) return authCheck;

    const existingDay = await prisma.itineraryDay.findUnique({
      where: { id: dayId },
      select: { tripId: true },
    });
    if (!existingDay || existingDay.tripId !== tripId) {
      return { error: 'Forbidden' };
    }

    await prisma.itineraryDay.delete({ where: { id: dayId } });

    revalidatePath(ITINERARY_PATH, 'page');
    return { success: true };
  } catch (error) {
    console.error(error);
    return { error: 'Server error' };
  }
}

export async function addItineraryItemAction(
  tripId: string,
  itineraryDayId: string,
  formData: FormData,
) {
  try {
    const authCheck = await verifyEditorAccess(tripId);
    if (authCheck.error) return authCheck;

    const t = await getTranslations('ItineraryValidations');
    const { AddItemSchema } = getItinerarySchemas({
      titleRequired: t('titleRequired'),
      invalidTimeFormat: t('invalidTimeFormat'),
      endTimeBeforeStart: t('endTimeBeforeStart'),
    } as Record<string, string>);

    const data = Object.fromEntries(formData.entries());
    const validatedFields = AddItemSchema.safeParse(data);

    if (!validatedFields.success) {
      return { fieldErrors: z.flattenError(validatedFields.error).fieldErrors };
    }

    const lastItem = await prisma.itineraryItem.findFirst({
      where: { itineraryDayId },
      orderBy: { order: 'desc' },
    });
    const newOrder = lastItem ? lastItem.order + 1 : 0;

    await prisma.itineraryItem.create({
      data: {
        itineraryDayId,
        title: validatedFields.data.title,
        startTime: validatedFields.data.startTime,
        endTime: validatedFields.data.endTime,
        notes: validatedFields.data.notes,
        order: newOrder,
      },
    });

    revalidatePath(ITINERARY_PATH, 'page');
    return { success: true };
  } catch (error) {
    console.error(error);
    return { error: 'Server error' };
  }
}

export async function updateItineraryItemAction(
  tripId: string,
  itemId: string,
  formData: FormData,
) {
  try {
    const authCheck = await verifyEditorAccess(tripId);
    if (authCheck.error) return authCheck;

    const existingItem = await prisma.itineraryItem.findUnique({
      where: { id: itemId },
      select: { itineraryDay: { select: { tripId: true } } },
    });
    if (!existingItem || existingItem.itineraryDay.tripId !== tripId) {
      return { error: 'Forbidden' };
    }

    const t = await getTranslations('ItineraryValidations');
    const { AddItemSchema } = getItinerarySchemas({
      titleRequired: t('titleRequired'),
      invalidTimeFormat: t('invalidTimeFormat'),
      endTimeBeforeStart: t('endTimeBeforeStart'),
    } as Record<string, string>);

    const data = Object.fromEntries(formData.entries());
    const validatedFields = AddItemSchema.safeParse(data);

    if (!validatedFields.success) {
      return { fieldErrors: z.flattenError(validatedFields.error).fieldErrors };
    }

    await prisma.itineraryItem.update({
      where: { id: itemId },
      data: {
        title: validatedFields.data.title,
        startTime: validatedFields.data.startTime,
        endTime: validatedFields.data.endTime,
        notes: validatedFields.data.notes,
      },
    });

    revalidatePath(ITINERARY_PATH, 'page');

    return { success: true };
  } catch (error) {
    console.error(error);
    return { error: 'Server error' };
  }
}

export async function deleteItineraryItemAction(
  tripId: string,
  itemId: string,
) {
  try {
    const authCheck = await verifyEditorAccess(tripId);
    if (authCheck.error) return authCheck;

    const existingItem = await prisma.itineraryItem.findUnique({
      where: { id: itemId },
      select: { itineraryDay: { select: { tripId: true } } },
    });
    if (!existingItem || existingItem.itineraryDay.tripId !== tripId) {
      return { error: 'Forbidden' };
    }

    await prisma.itineraryItem.delete({ where: { id: itemId } });

    revalidatePath(ITINERARY_PATH, 'page');
    return { success: true };
  } catch (error) {
    console.error(error);
    return { error: 'Server error' };
  }
}

export async function updateItineraryItemsAction(
  tripId: string,
  items: { id: string; itineraryDayId: string; order: number }[],
) {
  try {
    const authCheck = await verifyEditorAccess(tripId);
    if (authCheck.error) return authCheck;

    if (items.length === 0) return { success: true };

    const itemIds = items.map(i => i.id);
    const dayIds = [...new Set(items.map(i => i.itineraryDayId))];

    const [existingItems, existingDays] = await Promise.all([
      prisma.itineraryItem.findMany({
        where: { id: { in: itemIds } },
        select: { id: true, itineraryDay: { select: { tripId: true } } },
      }),
      prisma.itineraryDay.findMany({
        where: { id: { in: dayIds } },
        select: { id: true, tripId: true },
      }),
    ]);

    const allItemsBelong =
      existingItems.length === itemIds.length &&
      existingItems.every(i => i.itineraryDay.tripId === tripId);

    const allDaysBelong =
      existingDays.length === dayIds.length &&
      existingDays.every(d => d.tripId === tripId);

    if (!allItemsBelong || !allDaysBelong) {
      return { error: 'Forbidden' };
    }

    await prisma.$transaction(
      items.map(item =>
        prisma.itineraryItem.update({
          where: { id: item.id },
          data: { order: item.order, itineraryDayId: item.itineraryDayId },
        }),
      ),
    );

    revalidatePath(ITINERARY_PATH, 'page');
    return { success: true };
  } catch (error) {
    console.error(error);
    return { error: 'Server error' };
  }
}
