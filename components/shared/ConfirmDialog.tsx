'use client';

import { Button } from '@/components/ui/button';
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from '@/components/ui/dialog';

interface ConfirmDialogProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  onConfirm: () => void;
  isPending: boolean;
  confirmVariant?: 'destructive' | 'default';
  labels: {
    title: string;
    description: string;
    cancel: string;
    confirmButton: string;
  };
}

export default function ConfirmDialog({
  open,
  onOpenChange,
  onConfirm,
  isPending,
  confirmVariant = 'destructive',
  labels,
}: ConfirmDialogProps) {
  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="sm:max-w-106" showCloseButton={false}>
        <DialogHeader>
          <DialogTitle>{labels.title}</DialogTitle>
          <DialogDescription className="mt-2">
            {labels.description}
          </DialogDescription>
        </DialogHeader>
        <DialogFooter className="gap-2 mt-4">
          <Button
            variant="outline"
            className="cursor-pointer px-6"
            onClick={() => onOpenChange(false)}
            disabled={isPending}
          >
            {labels.cancel}
          </Button>
          <Button
            variant={confirmVariant}
            className="cursor-pointer px-6"
            onClick={onConfirm}
            disabled={isPending}
          >
            {labels.confirmButton}
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}
