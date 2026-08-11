import { Compass, Plus } from 'lucide-react';

import { Metadata } from 'next';
import { getLocale, getTranslations } from 'next-intl/server';

import { auth } from '@/auth';

import TripCard from '@/components/trip/TripCard';
import { Card, CardContent } from '@/components/ui/card';

import prisma from '@/lib/prisma';

import { CreateTripModal } from './_components/CreateTripModal';
import { NewTripButton } from './_components/NewTripButton';

export async function generateMetadata({
  params,
}: {
  params: Promise<{ locale: string }>;
}): Promise<Metadata> {
  const { locale } = await params;
  const t = await getTranslations({ locale, namespace: 'Metadata' });
  return {
    title: t('Trips'),
    robots: { index: false, follow: false },
  };
}

export default async function TripsDashboardPage() {
  const session = await auth();
  const locale = await getLocale();
  const t = await getTranslations('TripsDashboard');

  const tModal = await getTranslations('CreateTrip');
  const tVal = await getTranslations('TripValidations');

  const modalLabels = {
    title: tModal('title'),
    description: tModal('description'),
    nameLabel: tModal('nameLabel'),
    namePlaceholder: tModal('namePlaceholder'),
    descLabel: tModal('descLabel'),
    descPlaceholder: tModal('descPlaceholder'),
    submitButton: tModal('submitButton'),
    submitLoading: tModal('submitLoading'),
    backButton: tModal('backButton'),
    successToast: tModal('successToast'),
    timezoneLabel: tModal('timezoneLabel'),
    currencyLabel: tModal('currencyLabel'),
    searchTimezone: tModal('searchTimezone'),
    searchCurrency: tModal('searchCurrency'),
    noResult: tModal('noResult'),
    coverLabel: tModal('coverLabel'),
    coverPlaceholder: tModal('coverPlaceholder'),
  };

  const validationLabels = {
    nameMinLength: tVal('nameMinLength'),
    nameMaxLength: tVal('nameMaxLength'),
    descriptionMaxLength: tVal('descriptionMaxLength'),
    invalidUrl: tVal('invalidUrl'),
  };

  const userTrips = await prisma.tripMember.findMany({
    where: { userId: session?.user?.id },
    include: { trip: true },
    orderBy: { joinedAt: 'desc' },
  });

  return (
    <div className="container mx-auto px-4 md:px-8 py-8 md:py-12 max-w-6xl flex-1">
      <div className="flex flex-wrap justify-between gap-4 mb-6">
        <div className="space-y-2">
          <h1 className="text-3xl font-bold tracking-tight">{t('title')}</h1>
          <p className="text-muted-foreground">{t('description')}</p>
        </div>
        <NewTripButton className="shrink-0 ms-auto mt-auto cursor-pointer">
          <Plus className="size-4" />
          {t('newTripButton')}
        </NewTripButton>
      </div>

      {userTrips.length === 0 ? (
        <Card className="border-dashed bg-muted/30">
          <CardContent className="flex flex-col items-center justify-center py-16 text-center">
            <div className="p-4 bg-primary/10 rounded-full text-primary mb-4">
              <Compass className="size-8" />
            </div>
            <h2 className="text-xl font-semibold mb-2">{t('emptyTitle')}</h2>
            <p className="text-muted-foreground mb-6 max-w-sm">
              {t('emptyDesc')}
            </p>
            <NewTripButton variant="outline" className="cursor-pointer">
              {t('newTripButton')}
            </NewTripButton>
          </CardContent>
        </Card>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {userTrips.map(({ trip, role }) => (
            <TripCard
              key={trip.id}
              trip={trip}
              statusLabel={t(`status${trip.status}`)}
              roleLabel={t(`role${role}`)}
            />
          ))}
        </div>
      )}

      <CreateTripModal
        labels={modalLabels}
        valLabels={validationLabels}
        locale={locale}
      />
    </div>
  );
}
