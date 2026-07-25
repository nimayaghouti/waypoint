import { getTranslations } from 'next-intl/server';

import { redirect } from '@/i18n/navigation';

import { auth } from '@/auth';

import prisma from '@/lib/prisma';

import TripInviteActions from './_components/TripInviteActions';
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

  const tLayout = await getTranslations('TripLayout');
  const tNav = await getTranslations('TripNavigation');

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

  return (
    <div className="flex flex-col min-h-full bg-muted/10">
      <div className="bg-background border-b border-border/40 sticky top-16 z-40">
        <div className="container mx-auto px-4 md:px-8">
          <div className="py-4 flex flex-col gap-4 sm:flex-row justify-between">
            <div className="overflow-hidden space-y-4">
              <h1 className="text-xl font-bold truncate">
                {tripMember.trip.name}
              </h1>
              {tripMember.trip.description && (
                <p className="text-sm text-muted-foreground truncate mt-0.5">
                  {tripMember.trip.description}
                </p>
              )}
            </div>

            {tripMember.role === 'OWNER' && (
              <TripInviteActions
                inviteCode={tripMember.trip.inviteCode}
                locale={locale}
                labels={layoutLabels}
              />
            )}
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
