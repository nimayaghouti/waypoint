'use server';

import { revalidatePath } from 'next/cache';

import { auth } from '@/auth';

import { DEFAULT_TRIP_TIMEZONE, isPastDateString } from '@/lib/date-helpers';
import { AvailabilityStatus } from '@/lib/generated/prisma/enums';
import prisma from '@/lib/prisma';

type ActionResult = { success: true } | { error: string };

const MAX_BULK_DATES = 366;

type MembershipCheck =
  { ok: true; timezone: string } | { ok: false; error: string };

async function assertMembershipAndGetTimezone(
  tripId: string,
  userId: string,
): Promise<MembershipCheck> {
  const trip = await prisma.trip.findUnique({
    where: { id: tripId },
    select: {
      timezone: true,
      members: { where: { userId }, select: { id: true } },
    },
  });

  if (!trip) return { ok: false, error: 'Not found' };
  if (trip.members.length === 0) return { ok: false, error: 'Forbidden' };

  return { ok: true, timezone: trip.timezone ?? DEFAULT_TRIP_TIMEZONE };
}

function toUtcNoon(dateString: string): Date {
  return new Date(`${dateString}T12:00:00Z`);
}

export async function setAvailabilityAction(
  tripId: string,
  dateString: string,
  status: AvailabilityStatus | null,
  locale: string,
): Promise<ActionResult> {
  try {
    const session = await auth();
    if (!session?.user?.id) return { error: 'Unauthorized' };
    const userId = session.user.id;

    const membership = await assertMembershipAndGetTimezone(tripId, userId);
    if (!membership.ok) return { error: membership.error };

    if (isPastDateString(dateString, membership.timezone)) {
      return { error: 'Cannot edit a past date' };
    }

    const targetDate = toUtcNoon(dateString);

    if (status === null) {
      await prisma.availability.deleteMany({
        where: { tripId, userId, date: targetDate },
      });
    } else {
      await prisma.availability.upsert({
        where: { tripId_userId_date: { tripId, userId, date: targetDate } },
        create: { tripId, userId, date: targetDate, status },
        update: { status },
      });
    }

    revalidatePath(`/${locale}/trips/${tripId}/calendar`);
    return { success: true };
  } catch (error) {
    console.error(error);
    return { error: 'Server error' };
  }
}

export async function bulkSetAvailabilityAction(
  tripId: string,
  dateStrings: string[],
  status: AvailabilityStatus | null,
  locale: string,
): Promise<ActionResult> {
  try {
    if (dateStrings.length === 0) return { error: 'No dates selected' };
    if (dateStrings.length > MAX_BULK_DATES) return { error: 'Too many dates' };

    const session = await auth();
    if (!session?.user?.id) return { error: 'Unauthorized' };
    const userId = session.user.id;

    const membership = await assertMembershipAndGetTimezone(tripId, userId);
    if (!membership.ok) return { error: membership.error };

    const validDateStrings = [...new Set(dateStrings)].filter(
      d => !isPastDateString(d, membership.timezone),
    );

    if (validDateStrings.length === 0) {
      return { error: 'All selected dates are in the past' };
    }

    await prisma.$transaction(
      validDateStrings.map(dateString => {
        const targetDate = toUtcNoon(dateString);
        return status === null
          ? prisma.availability.deleteMany({
              where: { tripId, userId, date: targetDate },
            })
          : prisma.availability.upsert({
              where: {
                tripId_userId_date: { tripId, userId, date: targetDate },
              },
              create: { tripId, userId, date: targetDate, status },
              update: { status },
            });
      }),
    );

    revalidatePath(`/${locale}/trips/${tripId}/calendar`);
    return { success: true };
  } catch (error) {
    console.error(error);
    return { error: 'Server error' };
  }
}
