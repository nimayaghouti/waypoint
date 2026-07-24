import { getLocale, getTranslations } from 'next-intl/server';

import { redirect } from '@/i18n/navigation';

import { auth } from '@/auth';

import { CalendarLabels } from '@/lib/calendar-lib';
import {
  DEFAULT_TRIP_TIMEZONE,
  getTodayDateStringInTimeZone,
} from '@/lib/date-helpers';
import prisma from '@/lib/prisma';

import HeatmapCalendar from './_components/HeatmapCalendar';

export default async function TripCalendarPage({
  params,
}: {
  params: Promise<{ tripId: string }>;
}) {
  const { tripId } = await params;
  const locale = await getLocale();
  const session = await auth();

  if (!session?.user?.id) return redirect({ href: '/login', locale });

  const t = await getTranslations('Calendar');

  const labels: CalendarLabels = {
    title: t('title'),
    description: t('description'),
    legend: t('legend'),
    statusAVAILABLE: t('statusAVAILABLE'),
    statusMAYBE: t('statusMAYBE'),
    statusUNAVAILABLE: t('statusUNAVAILABLE'),
    statusNONE: t('statusNONE'),
    selectMultiple: t('selectMultiple'),
    exitSelectMode: t('exitSelectMode'),
    daysSelectedSuffix: t('daysSelectedSuffix'),
    cancelSelection: t('cancelSelection'),
    errorUpdate: t('errorUpdate'),
  };

  const trip = await prisma.trip.findUnique({
    where: { id: tripId },
    include: {
      members: true,
      availabilities: true,
    },
  });

  if (!trip) return null;

  const timezone = trip.timezone ?? DEFAULT_TRIP_TIMEZONE;
  const todayDateString = getTodayDateStringInTimeZone(timezone);

  return (
    <div className="flex flex-col gap-6">
      <div className="w-full max-w-3xl mx-auto space-y-2">
        <h2 className="text-2xl font-bold">{t('title')}</h2>
        <p className="text-muted-foreground">{t('description')}</p>
      </div>

      <HeatmapCalendar
        tripId={trip.id}
        currentUserId={session.user.id}
        totalMembers={trip.members.length}
        availabilities={trip.availabilities}
        labels={labels}
        locale={locale}
        todayDateString={todayDateString}
      />
    </div>
  );
}
