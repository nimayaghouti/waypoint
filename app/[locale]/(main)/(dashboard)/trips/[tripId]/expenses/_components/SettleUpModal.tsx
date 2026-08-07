'use client';

import { ArrowRight, CheckCircle2, Loader2 } from 'lucide-react';

import { useFormatter } from 'next-intl';
import { useMemo, useState, useTransition } from 'react';
import { toast } from 'sonner';

import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';
import { Button } from '@/components/ui/button';
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from '@/components/ui/dialog';
import { ScrollArea } from '@/components/ui/scroll-area';

import { addSettlementAction } from '@/lib/actions/expense';
import { BalanceData, calculateOptimalSettlements } from '@/lib/settlement';

interface Props {
  tripId: string;
  balances: BalanceData[];
  currency: string;
  labels: Record<string, string>;
  canEdit: boolean;
}

export default function SettleUpModal({
  tripId,
  balances,
  currency,
  labels,
  canEdit,
}: Props) {
  const [isOpen, setIsOpen] = useState(false);
  const [isPending, startTransition] = useTransition();
  const [settlingId, setSettlingId] = useState<string | null>(null);

  const format = useFormatter();

  const suggestedTransactions = useMemo(
    () => calculateOptimalSettlements(balances),
    [balances],
  );

  const handleRecordPayment = (
    fromUserId: string,
    toUserId: string,
    amount: number,
    index: number,
  ) => {
    if (!canEdit) return;
    setSettlingId(index.toString());

    startTransition(async () => {
      const result = await addSettlementAction(
        tripId,
        fromUserId,
        toUserId,
        amount,
      );
      if (result.error) {
        toast.error('Failed to record payment');
      } else {
        toast.success(labels.successSettled);
      }
      setSettlingId(null);
    });
  };

  return (
    <Dialog open={isOpen} onOpenChange={setIsOpen}>
      <DialogTrigger asChild>
        <Button
          className="w-full cursor-pointer gap-2"
          variant="secondary"
          disabled={suggestedTransactions.length === 0}
        >
          {labels.settleUp}
        </Button>
      </DialogTrigger>
      <DialogContent className="sm:max-w-112.5 max-h-[90vh] overflow-hidden px-0">
        <ScrollArea
          className="px-2"
          viewportProps={{ className: 'h-auto! max-h-[80vh]' }}
        >
          <DialogHeader className="px-2">
            <DialogTitle className="flex items-center gap-2">
              {labels.settleUp}
            </DialogTitle>
            <DialogDescription>{labels.settleUpDesc}</DialogDescription>
          </DialogHeader>

          <div className="flex flex-col gap-4 mt-4 px-2 pb-2">
            {suggestedTransactions.length === 0 ? (
              <div className="flex flex-col items-center justify-center py-10 text-center opacity-70">
                <CheckCircle2 className="size-10 text-green-500 mb-3" />
                <p className="font-medium text-foreground">{labels.noDebts}</p>
              </div>
            ) : (
              suggestedTransactions.map((tx, idx) => (
                <div
                  key={idx}
                  className="flex flex-col gap-3 p-3 border border-border/50 rounded-xl bg-muted/10"
                >
                  <div className="flex flex-col sm:flex-row items-center justify-between text-sm">
                    <div className="flex items-center gap-2 flex-1 min-w-0">
                      <Avatar className="size-6 shrink-0">
                        <AvatarImage src={tx.fromUser.image || undefined} />
                        <AvatarFallback className="text-[10px]">
                          {tx.fromUser.name.charAt(0)}
                        </AvatarFallback>
                      </Avatar>
                      <span className="font-semibold truncate">
                        {tx.fromUser.name}
                      </span>
                    </div>

                    <div className="flex flex-col items-center shrink-0 p-2 text-muted-foreground">
                      <span className="text-[10px] uppercase mb-0.5">
                        {labels.owesTo}
                      </span>
                      <ArrowRight className="size-4 rotate-90 sm:rotate-0 sm:rtl:rotate-180" />
                    </div>

                    <div className="flex flex-row-reverse sm:flex-row items-center justify-end gap-2 flex-1 min-w-0">
                      <span className="font-semibold truncate">
                        {tx.toUser.name}
                      </span>
                      <Avatar className="size-6 shrink-0">
                        <AvatarImage src={tx.toUser.image || undefined} />
                        <AvatarFallback className="text-[10px]">
                          {tx.toUser.name.charAt(0)}
                        </AvatarFallback>
                      </Avatar>
                    </div>
                  </div>

                  <div className="flex items-center justify-between mt-2 pt-2 border-t border-border/50">
                    <span
                      className="font-bold text-base text-emerald-600 dark:text-emerald-400"
                      dir="ltr"
                    >
                      {format.number(tx.amount, {
                        style: 'currency',
                        currency,
                      })}
                    </span>
                    {canEdit && (
                      <Button
                        size="sm"
                        className="h-7 text-xs cursor-pointer"
                        onClick={() =>
                          handleRecordPayment(
                            tx.fromUser.userId,
                            tx.toUser.userId,
                            tx.amount,
                            idx,
                          )
                        }
                        disabled={isPending}
                      >
                        {settlingId === idx.toString() ? (
                          <>
                            <Loader2 className="size-3 animate-spin rtl:ml-1 ltr:mr-1" />
                            {labels.settling}
                          </>
                        ) : (
                          labels.markAsSettled
                        )}
                      </Button>
                    )}
                  </div>
                </div>
              ))
            )}
          </div>
        </ScrollArea>
      </DialogContent>
    </Dialog>
  );
}
