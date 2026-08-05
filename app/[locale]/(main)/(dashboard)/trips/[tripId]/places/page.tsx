import { Metadata } from 'next';
import { getTranslations } from 'next-intl/server';

import { redirect } from '@/i18n/navigation';

import { auth } from '@/auth';

import prisma from '@/lib/prisma';

import PlacesManager from './_components/PlacesManager';

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
    title: `${t('Places')} | ${trip?.name || 'Trip'}`,
    robots: { index: false, follow: false },
  };
}

export default async function TripPlacesPage({
  params,
}: {
  params: Promise<{ tripId: string; locale: string }>;
}) {
  const { tripId, locale } = await params;
  const session = await auth();

  if (!session?.user?.id) return redirect({ href: '/login', locale });

  const t = await getTranslations('Places');
  const labels = {
    title: t('title'),
    description: t('description'),
    searchPlaceholder: t('searchPlaceholder'),
    addPlace: t('addPlace'),
    noPlaces: t('noPlaces'),
    savedPlaces: t('savedPlaces'),
    searchResults: t('searchResults'),
    saveError: t('saveError'),
    saveSuccess: t('saveSuccess'),
    deleteError: t('deleteError'),
    deleteSuccess: t('deleteSuccess'),
    searching: t('searching'),
    addPin: t('addPin'),
    addPinModeActive: t('addPinModeActive'),
    namePlaceholder: t('namePlaceholder'),
    geocoding: t('geocoding'),
    save: t('save'),
    cancel: t('cancel'),
    updateError: t('updateError'),
    updateSuccess: t('updateSuccess'),
    duplicateError: t('duplicateError'),
    tabSaved: t('tabSaved'),
    tabExplore: t('tabExplore'),
    explorePrompt: t('explorePrompt'),
    exploreButton: t('exploreButton'),
    exploring: t('exploring'),
    categoryTourism: t('categoryTourism'),
    categoryFood: t('categoryFood'),
    noPoisFound: t('noPoisFound'),
    exploreStalePrompt: t('exploreStalePrompt'),
    enrichPlace: t('enrichPlace'),
    enriching: t('enriching'),
    enrichSuccess: t('enrichSuccess'),
    enrichError: t('enrichError'),
    semanticSearchPlaceholder: t('semanticSearchPlaceholder'),
    aiSearchTitle: t('aiSearchTitle'),
    aiSearchDescription: t('aiSearchDescription'),
    aiSearchNoSavedPlaces: t('aiSearchNoSavedPlaces'),
    aiSearchEmpty: t('aiSearchEmpty'),
    similarityScore: t('similarityScore', { score: '{score}' }),
  };

  const tripMember = await prisma.tripMember.findUnique({
    where: { tripId_userId: { tripId, userId: session.user.id } },
  });

  if (!tripMember) return redirect({ href: '/trips', locale });

  const savedPlaces = await prisma.place.findMany({
    where: { tripId },
    orderBy: { createdAt: 'desc' },
  });

  const canEdit = tripMember.role === 'OWNER' || tripMember.role === 'EDITOR';

  return (
    <div className="flex flex-col gap-6 max-w-6xl mx-auto w-full">
      <div className="space-y-2">
        <h2 className="text-2xl font-bold">{labels.title}</h2>
        <p className="text-muted-foreground">{labels.description}</p>
      </div>

      <PlacesManager
        tripId={tripId}
        savedPlaces={savedPlaces}
        locale={locale}
        labels={labels}
        canEdit={canEdit}
      />
    </div>
  );
}
