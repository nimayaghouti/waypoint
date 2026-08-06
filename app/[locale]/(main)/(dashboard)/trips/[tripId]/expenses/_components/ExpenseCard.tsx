'use client';

import { Trash2 } from 'lucide-react';

import { useFormatter } from 'next-intl';
import { useState, useTransition } from 'react';
import { toast } from 'sonner';

import ConfirmDialog from '@/components/shared/ConfirmDialog';
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';
import { Button } from '@/components/ui/button';
import { Card } from '@/components/ui/card';

import { deleteExpenseAction } from '@/lib/actions/expense';

interface ShareInfo {
  userId: string;
  amount: number;
  user: { name: string | null; email: string };
}

interface ExpenseData {
  id: string;
  description: string;
  amount: number;
  currency: string;
  createdAt: Date;
  paidBy: {
    id: string;
    name: string | null;
    email: string;
    image: string | null;
  } | null;
  shares: ShareInfo[];
}

interface Props {
  tripId: string;
  expense: ExpenseData;
  canEdit: boolean;
  labels: Record<string, string>;
}

export default function ExpenseCard({
  tripId,
  expense,
  canEdit,
  labels,
}: Props) {
  const [confirmOpen, setConfirmOpen] = useState(false);
  const [isPending, startTransition] = useTransition();
  const format = useFormatter();

  const payerName =
    expense.paidBy?.name ||
    expense.paidBy?.email.split('@')[0] ||
    labels.unknownUser ||
    'Unknown';

  const handleDelete = () => {
    startTransition(async () => {
      const result = await deleteExpenseAction(tripId, expense.id);
      if (result.error) toast.error(result.error);
      else toast.success(labels.successDeleted);
      setConfirmOpen(false);
    });
  };

  return (
    <>
      <Card className="p-4 border-border/50 shadow-sm hover:shadow-md transition-all group">
        <div className="flex items-center justify-between gap-4">
          <div className="flex items-center gap-3">
            <Avatar className="size-10">
              <AvatarImage src={expense.paidBy?.image || ''} />
              <AvatarFallback>{payerName.charAt(0)}</AvatarFallback>
            </Avatar>
            <div>
              <h4 className="font-semibold text-base">{expense.description}</h4>
              <p className="text-xs text-muted-foreground">
                {payerName} (
                {labels.splitCount.replace(
                  '{count}',
                  format.number(expense.shares.length),
                )}
                )
              </p>
            </div>
          </div>

          <div className="flex items-center gap-3">
            <div className="text-end">
              <span className="font-bold text-base" dir="ltr">
                {format.number(expense.amount, {
                  style: 'currency',
                  currency: expense.currency,
                })}
              </span>
            </div>

            {canEdit && (
              <Button
                variant="ghost"
                size="icon"
                onClick={() => setConfirmOpen(true)}
                disabled={isPending}
                className="size-8 text-muted-foreground hover:text-destructive cursor-pointer opacity-100 [@media(hover:hover)]:opacity-0 [@media(hover:hover)]:group-hover:opacity-100 transition-opacity"
              >
                <Trash2 className="size-4" />
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
          title: labels.title,
          description: labels.deleteConfirm,
          cancel: labels.cancel,
          confirmButton: labels.deleteConfirmButton,
        }}
      />
    </>
  );
}
