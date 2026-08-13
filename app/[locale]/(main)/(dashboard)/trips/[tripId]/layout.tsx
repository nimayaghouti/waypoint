import { getTranslations } from 'next-intl/server';

import { redirect } from '@/i18n/navigation';

import { auth } from '@/auth';

import prisma from '@/lib/prisma';

import TripStatusControl from '@/components/trip/TripStatusControl';

import LeaveTripButton from './_components/LeaveTripButton';
import TripInfoDialog from './_components/TripInfoDialog';
import TripInviteActions from './_components/TripInviteActions';
import TripSettingsDialog from './_components/TripSettingsDialog';
import TripTabBar from './_components/TripTabBar';

export default async function TripDashboardLayout({
  children,
  params,
}: {
  children: React.ReactNode;
  params: Promise<{ tripId: string; locale: string }>;
}) {
  const { tripId, locale } = await params;
  const session = await auth();

  const userId = session?.user?.id;

  if (!userId) {
    redirect({ href: '/login', locale });
    return null;
  }

  const tripMember = await prisma.tripMember.findUnique({
    where: {
      tripId_userId: {
        tripId,
        userId,
      },
    },
    include: {
      trip: true,
    },
  });

  if (!tripMember || !tripMember.trip) {
    redirect({ href: '/trips', locale });
    return null;
  }

  const trip = tripMember.trip;
  const isOwner = tripMember.role === 'OWNER';

  const tLayout = await getTranslations('TripLayout');
  const tNav = await getTranslations('TripNavigation');
  const tSettings = await getTranslations('TripSettings');
  const tInfo = await getTranslations('TripInfo');
  const tStatus = await getTranslations('TripStatus');
  const tLeave = await getTranslations('LeaveTrip');

  const layoutLabels = {
    inviteButton: tLayout('inviteButton'),
    copyCode: tLayout('copyCode'),
    copyLink: tLayout('copyLink'),
    codeCopied: tLayout('codeCopied'),
    linkCopied: tLayout('linkCopied'),
  };
  const navLabels = {
    overview: tNav('overview'),
    calendar: tNav('calendar'),
    polls: tNav('polls'),
    itinerary: tNav('itinerary'),
    places: tNav('places'),
    expenses: tNav('expenses'),
    chat: tNav('chat'),
  };
  const settingsLabels = {
    settingsButton: tSettings('settingsButton'),
    dialogTitle: tSettings('dialogTitle'),
    dialogDesc: tSettings('dialogDesc'),
    timezoneLabel: tSettings('timezoneLabel'),
    currencyLabel: tSettings('currencyLabel'),
    searchTimezone: tSettings('searchTimezone'),
    searchCurrency: tSettings('searchCurrency'),
    noResult: tSettings('noResult'),
    save: tSettings('save'),
    saving: tSettings('saving'),
    success: tSettings('success'),
    errorGeneric: tSettings('errorGeneric'),
  };
  const infoLabels = {
    editButton: tInfo('editButton'),
    dialogTitle: tInfo('dialogTitle'),
    dialogDesc: tInfo('dialogDesc'),
    nameLabel: tInfo('nameLabel'),
    descLabel: tInfo('descLabel'),
    coverLabel: tInfo('coverLabel'),
    coverPlaceholder: tInfo('coverPlaceholder'),
    save: tInfo('save'),
    success: tInfo('success'),
    errorGeneric: tInfo('errorGeneric'),
  };
  const statusLabels = {
    statusPLANNING: tStatus('statusPLANNING'),
    statusCONFIRMED: tStatus('statusCONFIRMED'),
    statusCOMPLETED: tStatus('statusCOMPLETED'),
    statusARCHIVED: tStatus('statusARCHIVED'),
    success: tStatus('success'),
    errorGeneric: tStatus('errorGeneric'),
  };
  const leaveLabels = {
    leaveButton: tLeave('leaveButton'),
    dialogTitle: tLeave('dialogTitle'),
    dialogDesc: tLeave('dialogDesc'),
    cancel: tLeave('cancel'),
    confirmButton: tLeave('confirmButton'),
    success: tLeave('success'),
    errorGeneric: tLeave('errorGeneric'),
  };

  return (
    <div className="flex flex-col min-h-full bg-muted/10">
      <div className="bg-background border-b border-border/40 sticky top-16 z-40">
        <div className="container mx-auto px-4 md:px-8">
          <div className="py-4 flex flex-col gap-4 sm:flex-row sm:items-start justify-between">
            {trip.coverImage && (
              <>
                {/* eslint-disable-next-line @next/next/no-img-element */}
                <img
                  src={trip.coverImage}
                  alt=""
                  loading="lazy"
                  className="absolute -z-10 inset-0 w-full h-full object-cover"
                />
                <div className="absolute -z-5 inset-0 bg-linear-to-t from-black/75 via-black/35 to-transparent" />
              </>
            )}
            <div className="relative flex-1 min-w-0 overflow-hidden">
              <div className="relative z-10 flex flex-col gap-4">
                <div className="flex items-center gap-2 flex-wrap">
                  <h1
                    className={`text-xl font-bold truncate ${trip.coverImage ? 'text-white' : ''}`}
                  >
                    {trip.name}
                  </h1>
                  <TripStatusControl
                    tripId={tripId}
                    status={trip.status}
                    canEdit={isOwner}
                    labels={statusLabels}
                  />
                </div>
                {trip.description && (
                  <p
                    className={`text-sm truncate ${trip.coverImage ? 'text-white/85' : 'text-muted-foreground'}`}
                  >
                    {trip.description}
                  </p>
                )}
              </div>
            </div>

            <div className="flex items-center gap-2 flex-wrap">
              {isOwner && (
                <>
                  <TripInfoDialog
                    tripId={tripId}
                    initialName={trip.name}
                    initialDescription={trip.description ?? ''}
                    initialCoverImage={trip.coverImage ?? ''}
                    labels={infoLabels}
                  />
                  <TripSettingsDialog
                    tripId={tripId}
                    initialTimezone={trip.timezone}
                    initialCurrency={trip.defaultCurrency}
                    locale={locale}
                    labels={settingsLabels}
                  />
                  <TripInviteActions
                    inviteCode={trip.inviteCode}
                    locale={locale}
                    labels={layoutLabels}
                  />
                </>
              )}
              <LeaveTripButton tripId={tripId} labels={leaveLabels} />
            </div>
          </div>
          <TripTabBar tripId={tripId} labels={navLabels} />
        </div>
      </div>

      <div className="container mx-auto px-4 py-6 md:px-8 md:py-8 flex-1">
        {children}
      </div>
    </div>
  );
}
