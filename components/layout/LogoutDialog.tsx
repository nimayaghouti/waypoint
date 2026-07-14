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

interface LogoutDialogProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  onConfirm: () => void;
  isLoggingOut: boolean;
  labels: {
    title: string;
    description: string;
    cancel: string;
    confirmButton: string;
  };
}

export function LogoutDialog({
  open,
  onOpenChange,
  onConfirm,
  isLoggingOut,
  labels,
}: LogoutDialogProps) {
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
            disabled={isLoggingOut}
          >
            {labels.cancel}
          </Button>
          <Button
            variant="destructive"
            className="cursor-pointer px-6"
            onClick={onConfirm}
            disabled={isLoggingOut}
          >
            {labels.confirmButton}
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}
