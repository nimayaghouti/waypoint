import { BarChart2 } from 'lucide-react';

import { Metadata } from 'next';
import { getTranslations } from 'next-intl/server';

import { redirect } from '@/i18n/navigation';

import { auth } from '@/auth';

import RevalidateOnFocus from '@/components/shared/RevalidateOnFocus';
import { Card, CardContent } from '@/components/ui/card';

import prisma from '@/lib/prisma';

import CreatePollModal from './_components/CreatePollModal';
import PollCard from './_components/PollCard';

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
    title: `${t('Polls')} | ${trip?.name || 'Trip'}`,
    robots: { index: false, follow: false },
  };
}

export default async function TripPollsPage({
  params,
}: {
  params: Promise<{ tripId: string; locale: string }>;
}) {
  const { tripId, locale } = await params;
  const session = await auth();

  if (!session?.user?.id) return redirect({ href: '/login', locale });

  const t = await getTranslations('Polls');
  const tVal = await getTranslations('PollValidations');
  const tPicker = await getTranslations('PlacePicker');

  const labels = {
    title: t('title'),
    description: t('description'),
    newPollButton: t('newPollButton'),
    createTitle: t('createTitle'),
    createDesc: t('createDesc'),
    questionLabel: t('questionLabel'),
    questionPlaceholder: t('questionPlaceholder'),
    typeLabel: t('typeLabel'),
    typeSingle: t('typeSingle'),
    typeSingleDescription: t('typeSingleDescription'),
    typeMulti: t('typeMulti'),
    typeMultiDescription: t('typeMultiDescription'),
    optionsLabel: t('optionsLabel'),
    addOption: t('addOption'),
    closesAtLabel: t('closesAtLabel'),
    closesAtDatePlaceholder: t('closesAtDatePlaceholder'),
    closesAtHint: t('closesAtHint'),
    createButton: t('createButton'),
    createLoading: t('createLoading'),
    successToast: t('successToast'),
    voteError: t('voteError'),
    votesCount: t('votesCount', { count: '{count}' }),
    submitVoteButton: t('submitVoteButton'),
    submitVoteLoading: t('submitVoteLoading'),
    selectAtLeastOneOption: t('selectAtLeastOneOption'),
    RetractVoteButton: t('RetractVoteButton'),
    closePollButton: t('closePollButton'),
    closePollConfirm: t('closePollConfirm'),
    closedBadge: t('closedBadge'),
    pollClosedError: t('pollClosedError'),
    alreadyVotedError: t('alreadyVotedError'),
    noVoteToCancelError: t('noVoteToCancelError'),
    alreadyClosedError: t('alreadyClosedError'),
    timePlaceholder: t('timePlaceholder'),
    closePollDialogTitle: t('closePollDialogTitle'),
    closePollDialogCancel: t('closePollDialogCancel'),
    optionDraftPlaceholder: t('optionDraftPlaceholder'),
    removePlaceLabel: t('removePlaceLabel'),
    emptyOptionFallback: t('emptyOptionFallback'),
  };

  const valLabels = {
    questionMin: tVal('questionMin'),
    optionRequired: tVal('optionRequired'),
    minOptions: tVal('minOptions'),
    closesAtRequired: tVal('closesAtRequired'),
    closesAtInvalid: tVal('closesAtInvalid'),
    closesAtFuture: tVal('closesAtFuture'),
  };

  const pickerLabels = {
    title: tPicker('title'),
    searchPlaceholder: tPicker('searchPlaceholder'),
    noPlaces: tPicker('noPlaces'),
    noResults: tPicker('noResults'),
  };

  const [member, polls, trip, savedPlaces] = await Promise.all([
    prisma.tripMember.findUnique({
      where: { tripId_userId: { tripId, userId: session.user.id } },
    }),
    prisma.poll.findMany({
      where: { tripId },
      include: {
        options: {
          include: {
            votes: true,
            place: { select: { name: true, address: true } },
          },
        },
      },
      orderBy: { createdAt: 'desc' },
    }),
    prisma.trip.findUnique({
      where: { id: tripId },
      select: { timezone: true },
    }),
    prisma.place.findMany({
      where: { tripId },
      select: { id: true, name: true, address: true },
      orderBy: { createdAt: 'desc' },
    }),
  ]);

  if (!trip) return null;

  const currentUserRole = member?.role ?? 'VIEWER';

  return (
    <>
      <RevalidateOnFocus />
      <div className="flex flex-col gap-6 max-w-3xl mx-auto">
        <div className="flex flex-wrap justify-between items-end gap-4">
          <div className="space-y-2">
            <h2 className="text-2xl font-bold">{t('title')}</h2>
            <p className="text-muted-foreground">{t('description')}</p>
          </div>
          <CreatePollModal
            locale={locale}
            tripId={tripId}
            tripTimezone={trip.timezone}
            labels={labels}
            valLabels={valLabels}
            savedPlaces={savedPlaces}
            pickerLabels={pickerLabels}
          />
        </div>

        {polls.length === 0 ? (
          <Card className="border-dashed bg-muted/30">
            <CardContent className="flex flex-col items-center justify-center py-16 text-center">
              <div className="p-4 bg-primary/10 rounded-full text-primary mb-4">
                <BarChart2 className="size-8" />
              </div>
              <h2 className="text-xl font-semibold mb-2">{t('emptyTitle')}</h2>
              <p className="text-muted-foreground">{t('emptyDesc')}</p>
            </CardContent>
          </Card>
        ) : (
          <div className="flex flex-col gap-6">
            {polls.map(poll => (
              <PollCard
                key={poll.id}
                tripId={tripId}
                currentUserId={session.user.id!}
                currentUserRole={currentUserRole}
                poll={poll}
                labels={labels}
              />
            ))}
          </div>
        )}
      </div>
    </>
  );
}
