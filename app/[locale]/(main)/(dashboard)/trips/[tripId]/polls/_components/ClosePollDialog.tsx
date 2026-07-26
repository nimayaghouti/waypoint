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

interface ClosePollDialogProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  onConfirm: () => void;
  isClosing: boolean;
  labels: {
    title: string;
    description: string;
    cancel: string;
    confirmButton: string;
  };
}

export default function ClosePollDialog({
  open,
  onOpenChange,
  onConfirm,
  isClosing,
  labels,
}: ClosePollDialogProps) {
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
            disabled={isClosing}
          >
            {labels.cancel}
          </Button>
          <Button
            variant="destructive"
            className="cursor-pointer px-6"
            onClick={onConfirm}
            disabled={isClosing}
          >
            {labels.confirmButton}
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}
