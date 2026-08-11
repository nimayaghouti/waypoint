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
import SettlementCard from './_components/SettlementCard';

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
    settleUp: t('settleUp'),
    settleUpDesc: t('settleUpDesc'),
    markAsSettled: t('markAsSettled'),
    settling: t('settling'),
    noDebts: t('noDebts'),
    owesTo: t('owesTo'),
    successSettled: t('successSettled'),
    paymentsTitle: t('paymentsTitle'),
    expensesListTitle: t('expensesListTitle'),
    deletePaymentConfirm: t('deletePaymentConfirm'),
    successPaymentDeleted: t('successPaymentDeleted'),
    paidTo: t('paidTo'),
  };

  const valLabels = {
    descRequired: tVal('descRequired'),
    amountRequired: tVal('amountRequired'),
    paidByRequired: tVal('paidByRequired'),
    sharesMismatch: tVal('sharesMismatch'),
    sharesRequired: tVal('sharesRequired'),
  };

  const [trip, expenses, settlements] = await Promise.all([
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
    prisma.settlement.findMany({
      where: { tripId },
      include: {
        fromUser: {
          select: { id: true, name: true, email: true, image: true },
        },
        toUser: { select: { id: true, name: true, email: true, image: true } },
      },
      orderBy: { createdAt: 'desc' },
    }),
  ]);

  if (!trip) return null;

  const currentMember = trip.members.find(m => m.userId === session.user?.id);
  if (!currentMember) return redirect({ href: '/trips', locale });

  const canEdit =
    currentMember.role === 'OWNER' || currentMember.role === 'EDITOR';

  const balanceMap = new Map<string, Record<string, number>>();

  trip.members.forEach(m => balanceMap.set(m.userId, {}));

  expenses.forEach(e => {
    const curr = e.currency;
    if (e.paidById) {
      const userBals = balanceMap.get(e.paidById);
      if (userBals) userBals[curr] = (userBals[curr] || 0) + Number(e.amount);
    }
    e.shares.forEach(s => {
      const userBals = balanceMap.get(s.userId);
      if (userBals) userBals[curr] = (userBals[curr] || 0) - Number(s.amount);
    });
  });

  settlements.forEach(s => {
    const curr = s.currency;
    if (s.fromUserId) {
      const userBals = balanceMap.get(s.fromUserId);
      if (userBals) userBals[curr] = (userBals[curr] || 0) + Number(s.amount);
    }
    if (s.toUserId) {
      const userBals = balanceMap.get(s.toUserId);
      if (userBals) userBals[curr] = (userBals[curr] || 0) - Number(s.amount);
    }
  });

  interface MemberBalance {
    userId: string;
    name: string;
    image: string | null;
    netBalance: number;
    currency: string;
  }

  const balances: MemberBalance[] = [];

  trip.members.forEach(m => {
    const userBals = balanceMap.get(m.userId);
    let hasBalance = false;

    if (userBals) {
      Object.entries(userBals).forEach(([curr, net]) => {
        if (Math.abs(net) > 0.005) {
          hasBalance = true;
          balances.push({
            userId: m.userId,
            name: m.user.name || m.user.email.split('@')[0],
            image: m.user.image,
            netBalance: Math.round(net * 100) / 100,
            currency: curr,
          });
        }
      });
    }

    if (!hasBalance) {
      balances.push({
        userId: m.userId,
        name: m.user.name || m.user.email.split('@')[0],
        image: m.user.image,
        netBalance: 0,
        currency: trip.defaultCurrency,
      });
    }
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
    <div className="flex flex-col gap-6 max-w-4xl mx-auto w-full pb-12 md:pb-0">
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

      {formattedExpenses.length === 0 && settlements.length === 0 ? (
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
        <>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
            <div className="md:col-span-2 flex flex-col gap-8">
              {formattedExpenses.length > 0 && (
                <div className="flex flex-col gap-3">
                  <h3 className="text-lg font-bold text-foreground/70 dark:text-foreground/80 mb-1">
                    {labels.expensesListTitle}
                  </h3>
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
              )}

              {settlements.length > 0 && (
                <div className="flex flex-col gap-3">
                  <h3 className="text-lg font-bold text-foreground/70 dark:text-foreground/80 mb-1">
                    {labels.paymentsTitle}
                  </h3>
                  {settlements.map(settlement => {
                    const canDeleteSettlement =
                      canEdit ||
                      settlement.fromUserId === session.user?.id ||
                      settlement.toUserId === session.user?.id;

                    return (
                      <SettlementCard
                        key={settlement.id}
                        tripId={tripId}
                        settlement={{
                          ...settlement,
                          amount: Number(settlement.amount),
                        }}
                        canDelete={canDeleteSettlement}
                        labels={labels}
                      />
                    );
                  })}
                </div>
              )}
            </div>

            <div className="hidden md:block w-full">
              <BalancesSummary
                variant="desktop"
                tripId={tripId}
                balances={balances}
                currency={trip.defaultCurrency}
                labels={labels}
                canEdit={canEdit}
                currentUserId={session.user.id!}
              />
            </div>
          </div>

          <BalancesSummary
            variant="mobile"
            tripId={tripId}
            balances={balances}
            currency={trip.defaultCurrency}
            labels={labels}
            canEdit={canEdit}
            currentUserId={session.user.id!}
          />
        </>
      )}
    </div>
  );
}
