'use client';

import { ChevronUp, Wallet } from 'lucide-react';

import { useFormatter } from 'next-intl';

import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { ScrollArea } from '@/components/ui/scroll-area';
import {
  Sheet,
  SheetContent,
  SheetHeader,
  SheetTitle,
  SheetTrigger,
} from '@/components/ui/sheet';

import { cn } from '@/lib/utils';

import SettleUpModal from './SettleUpModal';

interface MemberBalance {
  userId: string;
  name: string;
  image: string | null;
  netBalance: number;
  currency: string;
}

interface Props {
  balances: MemberBalance[];
  tripId: string;
  currency: string;
  canEdit: boolean;
  labels: Record<string, string>;
  currentUserId?: string;
  variant?: 'desktop' | 'mobile';
}

type Formatter = ReturnType<typeof useFormatter>;

function BalanceRow({
  balance,
  labels,
  format,
}: {
  balance: MemberBalance;
  labels: Record<string, string>;
  format: Formatter;
}) {
  return (
    <div className="flex items-center justify-between py-1 text-sm">
      <div className="flex items-center gap-2">
        <Avatar className="size-6">
          <AvatarImage src={balance.image || undefined} />
          <AvatarFallback className="text-[10px]">
            {balance.name.charAt(0)}
          </AvatarFallback>
        </Avatar>
        <span className="font-medium truncate max-w-25">{balance.name}</span>
      </div>

      <div className="flex flex-col items-end gap-0.5">
        {balance.netBalance !== 0 && (
          <span className="text-[10px] uppercase text-muted-foreground font-medium">
            {balance.netBalance > 0 ? labels.getsBack : labels.owes}
          </span>
        )}
        <span
          className={cn(
            'font-bold text-xs px-2 py-0.5 rounded-md',
            balance.netBalance > 0 &&
              'text-emerald-600 bg-emerald-500/10 dark:text-emerald-400',
            balance.netBalance < 0 && 'text-destructive bg-destructive/10',
            balance.netBalance === 0 && 'text-muted-foreground bg-muted',
          )}
        >
          {balance.netBalance === 0
            ? labels.settledUp
            : format.number(Math.abs(balance.netBalance), {
                style: 'currency',
                currency: balance.currency,
              })}
        </span>
      </div>
    </div>
  );
}

function BalancesList({
  balances,
  labels,
  format,
}: {
  balances: MemberBalance[];
  labels: Record<string, string>;
  format: Formatter;
}) {
  return (
    <div className="flex flex-col gap-3">
      {balances.map(b => (
        <BalanceRow
          key={`${b.userId}-${b.currency}`}
          balance={b}
          labels={labels}
          format={format}
        />
      ))}
    </div>
  );
}

export default function BalancesSummary({
  balances,
  tripId,
  currency,
  canEdit,
  labels,
  currentUserId,
  variant = 'desktop',
}: Props) {
  const format = useFormatter();

  const currentUserBalance = currentUserId
    ? balances.find(b => b.userId === currentUserId)
    : undefined;

  const unsettledCount = balances.filter(b => b.netBalance !== 0).length;

  const mobileTitle =
    currentUserBalance && currentUserBalance.netBalance !== 0
      ? currentUserBalance.netBalance > 0
        ? labels.getsBack
        : labels.owes
      : labels.balancesTitle;

  const mobileBadge = currentUserBalance ? (
    <span
      className={cn(
        'font-bold text-xs px-2 py-0.5 rounded-md whitespace-nowrap',
        currentUserBalance.netBalance > 0 &&
          'text-emerald-600 bg-emerald-500/10 dark:text-emerald-400',
        currentUserBalance.netBalance < 0 &&
          'text-destructive bg-destructive/10',
        currentUserBalance.netBalance === 0 && 'text-muted-foreground bg-muted',
      )}
    >
      {currentUserBalance.netBalance === 0
        ? labels.settledUp
        : format.number(Math.abs(currentUserBalance.netBalance), {
            style: 'currency',
            currency: currentUserBalance.currency || currency,
          })}
    </span>
  ) : (
    <span className="font-bold text-xs px-2 py-0.5 rounded-md bg-muted text-muted-foreground whitespace-nowrap">
      {unsettledCount > 0 ? unsettledCount : labels.settledUp}
    </span>
  );

  if (variant === 'desktop') {
    return (
      <div className="sticky top-56">
        <Card className="flex flex-col gap-0 border-border/50 shadow-sm">
          <CardHeader className="shrink-0 border-b border-border/10">
            <CardTitle className="text-base font-bold">
              {labels.balancesTitle}
            </CardTitle>
          </CardHeader>

          <CardContent className="flex-1 min-h-0 p-0 overflow-hidden flex flex-col">
            <ScrollArea
              className="px-4"
              viewportProps={{ className: 'h-auto! max-h-90' }}
            >
              <BalancesList
                balances={balances}
                labels={labels}
                format={format}
              />
            </ScrollArea>

            {canEdit && (
              <div className="shrink-0 px-4 pt-4 flex items-center border-t border-border/10">
                <SettleUpModal
                  tripId={tripId}
                  balances={balances}
                  currency={currency}
                  labels={labels}
                  canEdit={canEdit}
                />
              </div>
            )}
          </CardContent>
        </Card>
      </div>
    );
  }

  return (
    <div className="md:hidden fixed inset-x-0 bottom-0 z-40 border-t border-border/60 bg-background/95 backdrop-blur supports-backdrop-filter:bg-background/60">
      <div className="mx-auto w-full max-w-4xl px-2 pt-3 pb-[calc(0.75rem+env(safe-area-inset-bottom))]">
        <div className="w-full flex items-center gap-2">
          <Sheet>
            <SheetTrigger asChild>
              <Button
                variant="outline"
                aria-label={labels.balancesTitle}
                className="flex-1 h-auto justify-between gap-2 rounded-xl bg-card px-3 py-2 cursor-pointer"
              >
                <span className="flex items-center gap-2 min-w-0">
                  <Wallet className="size-4 text-primary shrink-0" />
                  <span className="truncate text-sm font-medium">
                    {mobileTitle}
                  </span>
                </span>

                <span className="flex items-center gap-2 shrink-0">
                  {mobileBadge}
                  <ChevronUp className="size-4 text-muted-foreground" />
                </span>
              </Button>
            </SheetTrigger>

            <SheetContent
              side="bottom"
              className="h-auto! max-h-[85vh]! rounded-t-3xl px-0 flex flex-col gap-0 overflow-hidden"
            >
              <SheetHeader className="px-6 text-start shrink-0">
                <SheetTitle className="flex items-center gap-2">
                  <Wallet className="size-5 text-primary" />
                  {labels.balancesTitle}
                </SheetTitle>
              </SheetHeader>

              <ScrollArea
                className="flex-1 min-h-0 px-6"
                viewportProps={{
                  className: cn(
                    'h-auto! py-2',
                    canEdit
                      ? 'max-h-[min(80vh,calc(85vh_-_8rem))]'
                      : 'max-h-[min(80vh,calc(85vh_-_4rem))]',
                  ),
                }}
              >
                <BalancesList
                  balances={balances}
                  labels={labels}
                  format={format}
                />
              </ScrollArea>

              {canEdit && (
                <div className="shrink-0 border-t border-border/40 px-6 py-4">
                  <SettleUpModal
                    tripId={tripId}
                    balances={balances}
                    currency={currency}
                    labels={labels}
                    canEdit={canEdit}
                  />
                </div>
              )}
            </SheetContent>
          </Sheet>

          {canEdit && (
            <div className="shrink-0">
              <SettleUpModal
                tripId={tripId}
                balances={balances}
                currency={currency}
                labels={labels}
                canEdit={canEdit}
              />
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
