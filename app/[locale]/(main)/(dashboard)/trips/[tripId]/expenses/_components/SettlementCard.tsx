'use client';

import { ArrowRight, Trash2 } from 'lucide-react';

import { useFormatter } from 'next-intl';
import { useState, useTransition } from 'react';
import { toast } from 'sonner';

import ConfirmDialog from '@/components/shared/ConfirmDialog';
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';
import { Button } from '@/components/ui/button';
import { Card } from '@/components/ui/card';

import { deleteSettlementAction } from '@/lib/actions/expense';

interface UserData {
  id: string;
  name: string | null;
  email: string;
  image: string | null;
}

interface SettlementData {
  id: string;
  amount: number;
  currency: string;
  createdAt: Date;
  fromUser: UserData | null;
  toUser: UserData | null;
}

interface Props {
  tripId: string;
  settlement: SettlementData;
  canDelete: boolean;
  labels: Record<string, string> & { unknownUser?: string };
}

export default function SettlementCard({
  tripId,
  settlement,
  canDelete,
  labels,
}: Props) {
  const [confirmOpen, setConfirmOpen] = useState(false);
  const [isPending, startTransition] = useTransition();
  const format = useFormatter();

  const fromName =
    settlement.fromUser?.name ||
    settlement.fromUser?.email.split('@')[0] ||
    labels.unknownUser ||
    'Unknown';
  const toName =
    settlement.toUser?.name ||
    settlement.toUser?.email.split('@')[0] ||
    labels.unknownUser ||
    'Unknown';

  const handleDelete = () => {
    startTransition(async () => {
      const result = await deleteSettlementAction(tripId, settlement.id);
      if (result.error) toast.error('Error deleting payment');
      else toast.success(labels.successPaymentDeleted);
      setConfirmOpen(false);
    });
  };

  return (
    <>
      <Card className="p-3 border-border/50 shadow-sm hover:shadow-md transition-all group bg-card">
        <div className="flex items-center justify-between gap-4">
          <div className="flex flex-col sm:flex-row items-center gap-3 min-w-0">
            <div className="flex items-center gap-1.5 min-w-0">
              <Avatar className="size-6 shrink-0">
                <AvatarImage src={settlement.fromUser?.image || undefined} />{' '}
                <AvatarFallback className="text-[10px]">
                  {fromName.charAt(0)}
                </AvatarFallback>
              </Avatar>
              <span className="font-semibold text-sm truncate">{fromName}</span>
            </div>

            <div className="flex flex-col items-center shrink-0 px-1 text-muted-foreground">
              <span className="text-[10px] uppercase mb-0.5 whitespace-nowrap">
                {labels.paidTo}
              </span>
              <ArrowRight className="size-3 rotate-90 sm:rotate-0 sm:rtl:rotate-180" />
            </div>

            <div className="flex flex-row-reverse sm:flex-row items-center gap-1.5 min-w-0">
              <span className="font-semibold text-sm truncate">{toName}</span>
              <Avatar className="size-6 shrink-0">
                <AvatarImage src={settlement.toUser?.image || undefined} />{' '}
                <AvatarFallback className="text-[10px]">
                  {toName.charAt(0)}
                </AvatarFallback>
              </Avatar>
            </div>
          </div>

          <div className="flex items-center gap-3 shrink-0">
            <div className="flex flex-col items-end">
              <span
                className="font-bold text-sm text-emerald-600 dark:text-emerald-400"
                dir="ltr"
              >
                {format.number(settlement.amount, {
                  style: 'currency',
                  currency: settlement.currency,
                })}
              </span>
              <span className="text-[10px] text-muted-foreground">
                {format.dateTime(new Date(settlement.createdAt), {
                  dateStyle: 'medium',
                })}
              </span>
            </div>

            {canDelete && (
              <Button
                variant="ghost"
                size="icon"
                onClick={() => setConfirmOpen(true)}
                disabled={isPending}
                className="size-7 text-muted-foreground hover:text-destructive cursor-pointer opacity-100 [@media(hover:hover)]:opacity-0 [@media(hover:hover)]:group-hover:opacity-100 transition-opacity"
              >
                <Trash2 className="size-3.5" />
              </Button>
            )}
          </div>
        </div>
      </Card>

      <ConfirmDialog
        open={confirmOpen}
        onOpenChange={setConfirmOpen}
        onConfirm={handleDelete}
        isPending={isPending}
        labels={{
          title: labels.paymentsTitle,
          description: labels.deletePaymentConfirm,
          cancel: labels.cancel,
          confirmButton: labels.deleteConfirmButton,
        }}
      />
    </>
  );
}
