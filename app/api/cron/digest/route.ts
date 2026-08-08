import { getTranslations } from 'next-intl/server';
import { NextResponse } from 'next/server';

import {
  DigestEmailLabels,
  sendDigestEmail,
  TripSummary,
} from '@/lib/email/resend';
import prisma from '@/lib/prisma';

export const dynamic = 'force-dynamic';

export async function GET(request: Request) {
  const authHeader = request.headers.get('authorization');
  const cronSecret = process.env.CRON_SECRET;

  if (process.env.NODE_ENV === 'production') {
    if (!cronSecret) {
      console.error('CRON_SECRET is not defined in environment variables.');
      return new Response('Internal Server Error', { status: 500 });
    }
    if (authHeader !== `Bearer ${cronSecret}`) {
      return new Response('Unauthorized', { status: 401 });
    }
  }

  try {
    const oneWeekAgo = new Date(Date.now() - 7 * 24 * 60 * 60 * 1000);

    const activeTrips = await prisma.trip.findMany({
      where: {
        status: { in: ['PLANNING', 'CONFIRMED'] },
        OR: [
          { expenses: { some: { createdAt: { gte: oneWeekAgo } } } },
          { polls: { some: { createdAt: { gte: oneWeekAgo } } } },
          { places: { some: { createdAt: { gte: oneWeekAgo } } } },
        ],
      },
      include: {
        members: {
          include: {
            user: {
              select: { id: true, name: true, email: true, locale: true },
            },
          },
        },
        _count: {
          select: {
            expenses: { where: { createdAt: { gte: oneWeekAgo } } },
            polls: { where: { createdAt: { gte: oneWeekAgo } } },
            places: { where: { createdAt: { gte: oneWeekAgo } } },
          },
        },
      },
    });

    if (activeTrips.length === 0) {
      return NextResponse.json({
        success: true,
        message: 'No active trips to report.',
      });
    }

    const userDigests = new Map<
      string,
      {
        user: {
          id: string;
          name: string | null;
          email: string;
          locale: string;
        };
        trips: TripSummary[];
      }
    >();

    for (const trip of activeTrips) {
      const summary: TripSummary = {
        id: trip.id,
        name: trip.name,
        expensesCount: trip._count.expenses,
        pollsCount: trip._count.polls,
        placesCount: trip._count.places,
      };

      for (const member of trip.members) {
        if (!member.user.email) continue;

        const existing = userDigests.get(member.userId) || {
          user: member.user,
          trips: [],
        };
        existing.trips.push(summary);
        userDigests.set(member.userId, existing);
      }
    }

    const emailPromises = Array.from(userDigests.values()).map(
      async ({ user, trips }) => {
        const t = await getTranslations({
          locale: user.locale,
          namespace: 'DigestEmail',
        });

        const labels: DigestEmailLabels = {
          subject: t('digestSubject'),
          title: t('digestTitle'),
          greeting: t('greeting'),
          intro: t('digestIntro'),
          newExpenses: t('newExpenses', { count: '{count}' }),
          newPolls: t('newPolls', { count: '{count}' }),
          newPlaces: t('newPlaces', { count: '{count}' }),
          viewTrip: t('viewTrip'),
          ignore: t('ignoreMessage'),
        };

        const userName = user.name || user.email.split('@')[0];
        return sendDigestEmail(
          user.email,
          userName,
          trips,
          user.locale,
          labels,
        );
      },
    );

    const results = await Promise.allSettled(emailPromises);
    const failed = results.filter(r => r.status === 'rejected');

    if (failed.length > 0) {
      console.error(`Failed to send ${failed.length} digest emails:`, failed);
    }

    return NextResponse.json({
      success: true,
      processedUsers: userDigests.size,
      failedEmails: failed.length,
    });
  } catch (error) {
    console.error('Cron Digest Error:', error);
    return NextResponse.json(
      { error: 'Failed to process digest' },
      { status: 500 },
    );
  }
}
