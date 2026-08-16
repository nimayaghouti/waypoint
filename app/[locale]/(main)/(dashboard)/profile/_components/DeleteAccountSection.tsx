'use client';

import { signOut } from 'next-auth/react';
import { useState, useTransition } from 'react';
import { toast } from 'sonner';

import { Button } from '@/components/ui/button';
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from '@/components/ui/dialog';
import { Input } from '@/components/ui/input';

import { deleteUserAccountAction } from '@/lib/actions/account';

interface Props {
  labels: Record<string, string>;
}

export default function DeleteAccountSection({ labels }: Props) {
  const [open, setOpen] = useState(false);
  const [confirmText, setConfirmText] = useState('');
  const [isPending, startTransition] = useTransition();

  const isMatched = confirmText === labels.deleteConfirmWord;

  const handleDelete = () => {
    startTransition(async () => {
      const result = await deleteUserAccountAction();
      if (result?.error) {
        toast.error(labels.deleteError);
        setOpen(false);
        return;
      }

      await signOut({ redirectTo: '/' });
    });
  };

  return (
    <>
      <div className="flex flex-col items-start gap-2">
        <p className="text-sm text-muted-foreground">{labels.deleteDesc}</p>
        <Button
          variant="destructive"
          onClick={() => setOpen(true)}
          className="cursor-pointer mt-2"
        >
          {labels.deleteButton}
        </Button>
      </div>

      <Dialog open={open} onOpenChange={setOpen}>
        <DialogContent className="sm:max-w-md">
          <DialogHeader>
            <DialogTitle className="text-destructive">
              {labels.deleteDialogTitle}
            </DialogTitle>
            <DialogDescription>{labels.deleteDialogDesc}</DialogDescription>
          </DialogHeader>
          <div className="mt-4">
            <Input
              value={confirmText}
              onChange={e => setConfirmText(e.target.value)}
              placeholder={labels.deleteInputPlaceholder}
              disabled={isPending}
              className="text-center font-bold"
              dir="auto"
            />
          </div>
          <DialogFooter className="mt-4 gap-2">
            <Button
              variant="outline"
              onClick={() => setOpen(false)}
              disabled={isPending}
              className="cursor-pointer"
            >
              {labels.cancel}
            </Button>
            <Button
              variant="destructive"
              onClick={handleDelete}
              disabled={isPending || !isMatched}
              className="cursor-pointer"
            >
              {isPending ? labels.deleting : labels.deleteButton}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </>
  );
}
