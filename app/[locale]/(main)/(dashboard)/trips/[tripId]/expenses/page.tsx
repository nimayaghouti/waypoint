import { Receipt } from 'lucide-react';

import { Metadata } from 'next';
import { getTranslations } from 'next-intl/server';

import { redirect } from '@/i18n/navigation';

import { auth } from '@/auth';

import { Card, CardContent } from '@/components/ui/card';

import prisma from '@/lib/prisma';

import AddExpenseModal from './_components/AddExpenseModal';
import BalancesSummary from './_components/BalancesSummary';
import ExpenseCard from './_components/ExpenseCard';

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
    title: `${t('Expenses')} | ${trip?.name || 'Trip'}`,
    robots: { index: false, follow: false },
  };
}

export default async function TripExpensesPage({
  params,
}: {
  params: Promise<{ tripId: string; locale: string }>;
}) {
  const { tripId, locale } = await params;
  const session = await auth();

  if (!session?.user?.id) return redirect({ href: '/login', locale });

  const [t, tVal] = await Promise.all([
    getTranslations('Expenses'),
    getTranslations('ExpenseValidations'),
  ]);

  const labels = {
    title: t('title'),
    description: t('description'),
    addExpense: t('addExpense'),
    emptyTitle: t('emptyTitle'),
    emptyDesc: t('emptyDesc'),
    descLabel: t('descLabel'),
    descPlaceholder: t('descPlaceholder'),
    amountLabel: t('amountLabel'),
    currency: t('currency'),
    amountPlaceholder: t('amountPlaceholder'),
    paidByLabel: t('paidByLabel'),
    splitHow: t('splitHow'),
    splitEqual: t('splitEqual'),
    splitCustom: t('splitCustom'),
    splitWithLabel: t('splitWithLabel'),
    splitCount: t('splitCount', { count: '{count}' }),
    save: t('save'),
    cancel: t('cancel'),
    successAdded: t('successAdded'),
    deleteConfirm: t('deleteConfirm'),
    deleteConfirmButton: t('deleteConfirmButton'),
    successDeleted: t('successDeleted'),
    balancesTitle: t('balancesTitle'),
    owes: t('owes'),
    getsBack: t('getsBack'),
    settledUp: t('settledUp'),
    unknownUser: t('unknownUser'),
  };

  const valLabels = {
    descRequired: tVal('descRequired'),
    amountRequired: tVal('amountRequired'),
    paidByRequired: tVal('paidByRequired'),
    sharesMismatch: tVal('sharesMismatch'),
    sharesRequired: tVal('sharesRequired'),
  };

  const [trip, expenses] = await Promise.all([
    prisma.trip.findUnique({
      where: { id: tripId },
      include: {
        members: {
          include: {
            user: { select: { name: true, email: true, image: true } },
          },
        },
      },
    }),
    prisma.expense.findMany({
      where: { tripId },
      include: {
        paidBy: { select: { id: true, name: true, email: true, image: true } },
        shares: {
          include: {
            user: { select: { name: true, email: true } },
          },
        },
      },
      orderBy: { createdAt: 'desc' },
    }),
  ]);

  if (!trip) return null;

  const currentMember = trip.members.find(m => m.userId === session.user?.id);
  if (!currentMember) return redirect({ href: '/trips', locale });

  const canEdit =
    currentMember.role === 'OWNER' || currentMember.role === 'EDITOR';

  const balances = trip.members.map(member => {
    const totalPaid = expenses
      .filter(e => e.paidById === member.userId)
      .reduce((sum, e) => sum + Number(e.amount), 0);

    const totalConsumed = expenses.reduce((sum, e) => {
      const myShare = e.shares.find(s => s.userId === member.userId);
      return sum + (myShare ? Number(myShare.amount) : 0);
    }, 0);

    return {
      userId: member.userId,
      name: member.user.name || member.user.email.split('@')[0],
      image: member.user.image,
      netBalance: Math.round((totalPaid - totalConsumed) * 100) / 100,
      currency: trip.defaultCurrency,
    };
  });

  const formattedExpenses = expenses.map(e => ({
    ...e,
    amount: Number(e.amount),
    shares: e.shares.map(s => ({
      userId: s.userId,
      amount: Number(s.amount),
      user: s.user,
    })),
  }));

  return (
    <div className="flex flex-col gap-6 max-w-4xl mx-auto w-full">
      <div className="flex flex-wrap justify-between items-end gap-4">
        <div className="space-y-2">
          <h2 className="text-2xl font-bold">{labels.title}</h2>
          <p className="text-muted-foreground">{labels.description}</p>
        </div>

        {canEdit && (
          <AddExpenseModal
            tripId={tripId}
            currentUserId={session.user.id!}
            defaultCurrency={trip.defaultCurrency}
            members={trip.members}
            labels={labels}
            valLabels={valLabels}
          />
        )}
      </div>

      {formattedExpenses.length === 0 ? (
        <Card className="border-dashed bg-muted/30">
          <CardContent className="flex flex-col items-center justify-center py-16 text-center">
            <div className="p-4 bg-primary/10 rounded-full text-primary mb-4">
              <Receipt className="size-8" />
            </div>
            <h3 className="text-xl font-semibold mb-2">{labels.emptyTitle}</h3>
            <p className="text-muted-foreground">{labels.emptyDesc}</p>
          </CardContent>
        </Card>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
          <div className="md:col-span-2 flex flex-col gap-3">
            {formattedExpenses.map(expense => (
              <ExpenseCard
                key={expense.id}
                tripId={tripId}
                expense={expense}
                canEdit={canEdit}
                labels={labels}
              />
            ))}
          </div>

          <div className="w-full">
            <BalancesSummary balances={balances} labels={labels} />
          </div>
        </div>
      )}
    </div>
  );
}
