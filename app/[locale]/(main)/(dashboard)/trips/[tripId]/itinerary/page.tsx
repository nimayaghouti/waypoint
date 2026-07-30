import { CalendarDays } from 'lucide-react';

import { Metadata } from 'next';
import { getTranslations } from 'next-intl/server';

import { redirect } from '@/i18n/navigation';

import { auth } from '@/auth';

import { Card, CardContent } from '@/components/ui/card';

import {
  DEFAULT_TRIP_TIMEZONE,
  getTodayDateStringInTimeZone,
} from '@/lib/date-helpers';
import prisma from '@/lib/prisma';

import AddDayButton from './_components/AddDayButton';
import ItineraryBoard from './_components/ItineraryBoard';

export async function generateMetadata({
  params,
}: {
  params: Promise<{ tripId: string; locale: string }>;
}): Promise<Metadata> {
  const { tripId, locale } = await params;
  const t = await getTranslations({ locale, namespace: 'Metadata' });
  const trip = await prisma.trip.findUnique({
    where: { id: tripId },
    select: { name: true },
  });

  return {
    title: `${t('Itinerary')} | ${trip?.name || 'Trip'}`,
    robots: { index: false, follow: false },
  };
}

export default async function TripItineraryPage({
  params,
}: {
  params: Promise<{ tripId: string; locale: string }>;
}) {
  const { tripId, locale } = await params;
  const session = await auth();

  if (!session?.user?.id) return redirect({ href: '/login', locale });

  const [t, tVal] = await Promise.all([
    getTranslations('Itinerary'),
    getTranslations('ItineraryValidations'),
  ]);

  const labels = {
    title: t('title'),
    description: t('description'),
    addDay: t('addDay'),
    emptyTitle: t('emptyTitle'),
    emptyDesc: t('emptyDesc'),
    addItem: t('addItem'),
    itemTitle: t('itemTitle'),
    itemTitlePlaceholder: t('itemTitlePlaceholder'),
    startTime: t('startTime'),
    endTime: t('endTime'),
    notes: t('notes'),
    notesPlaceholder: t('notesPlaceholder'),
    save: t('save'),
    cancel: t('cancel'),
    delete: t('delete'),
    successDayAdded: t('successDayAdded'),
    successItemAdded: t('successItemAdded'),
    successItemDeleted: t('successItemDeleted'),
    deleteDay: t('deleteDay'),
    deleteDayConfirm: t('deleteDayConfirm'),
    sortByTime: t('sortByTime'),
    timeWarning: t('timeWarning'),
    selectDatePlaceholder: t('selectDatePlaceholder'),
    timePlaceholder: t('timePlaceholder'),
    errorDeleteDay: t('errorDeleteDay'),
    errorSortItems: t('errorSortItems'),
    errorReorder: t('errorReorder'),
    errorDeleteItem: t('errorDeleteItem'),
    errorGeneric: t('errorGeneric'),
    editItem: t('editItem'),
    successItemUpdated: t('successItemUpdated'),
    deleteItem: t('deleteItem'),
    deleteItemConfirm: t('deleteItemConfirm'),
  };

  const validationLabels = {
    titleRequired: tVal('titleRequired'),
    invalidTimeFormat: tVal('invalidTimeFormat'),
    endTimeBeforeStart: tVal('endTimeBeforeStart'),
    dateRequired: tVal('dateRequired'),
    dateAlreadyExists: tVal('dateAlreadyExists'),
  };

  const [member, itineraryDays, trip] = await Promise.all([
    prisma.tripMember.findUnique({
      where: { tripId_userId: { tripId, userId: session.user.id } },
    }),
    prisma.itineraryDay.findMany({
      where: { tripId },
      orderBy: { date: 'asc' },
      include: {
        items: {
          orderBy: { order: 'asc' },
        },
      },
    }),
    prisma.trip.findUnique({
      where: { id: tripId },
      select: { timezone: true },
    }),
  ]);

  const timezone = trip?.timezone ?? DEFAULT_TRIP_TIMEZONE;
  const todayDateString = getTodayDateStringInTimeZone(timezone);

  const canEdit = member?.role === 'OWNER' || member?.role === 'EDITOR';

  return (
    <div className="flex flex-col gap-6 max-w-3xl mx-auto">
      <div className="flex flex-wrap justify-between items-end gap-4">
        <div className="space-y-2">
          <h2 className="text-2xl font-bold">{t('title')}</h2>
          <p className="text-muted-foreground">{t('description')}</p>
        </div>

        {canEdit && (
          <AddDayButton
            tripId={tripId}
            locale={locale}
            labels={labels}
            minDateKey={todayDateString}
          />
        )}
      </div>

      {itineraryDays.length === 0 ? (
        <Card className="border-dashed bg-muted/30">
          <CardContent className="flex flex-col items-center justify-center py-16 text-center">
            <div className="p-4 bg-primary/10 rounded-full text-primary mb-4">
              <CalendarDays className="size-8" />
            </div>
            <h2 className="text-xl font-semibold mb-2">{t('emptyTitle')}</h2>
            <p className="text-muted-foreground">{t('emptyDesc')}</p>
          </CardContent>
        </Card>
      ) : (
        <ItineraryBoard
          tripId={tripId}
          initialDays={itineraryDays}
          locale={locale}
          labels={labels}
          valLabels={validationLabels}
          canEdit={canEdit}
        />
      )}
    </div>
  );
}
