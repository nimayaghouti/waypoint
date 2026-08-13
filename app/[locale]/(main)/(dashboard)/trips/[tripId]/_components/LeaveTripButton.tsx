'use client';

import { LogOut } from 'lucide-react';

import { useState, useTransition } from 'react';
import { toast } from 'sonner';

import { useRouter } from '@/i18n/navigation';

import ConfirmDialog from '@/components/shared/ConfirmDialog';
import { Button } from '@/components/ui/button';

import { leaveTripAction } from '@/lib/actions/trip';

interface Props {
  tripId: string;
  labels: {
    leaveButton: string;
    dialogTitle: string;
    dialogDesc: string;
    cancel: string;
    confirmButton: string;
    success: string;
    errorGeneric: string;
  };
}

export default function LeaveTripButton({ tripId, labels }: Props) {
  const [confirmOpen, setConfirmOpen] = useState(false);
  const [isPending, startTransition] = useTransition();
  const router = useRouter();

  const handleLeave = () => {
    startTransition(async () => {
      const result = await leaveTripAction(tripId);
      if (result.error) {
        toast.error(labels.errorGeneric);
        setConfirmOpen(false);
        return;
      }
      toast.success(labels.success);
      router.push('/trips');
    });
  };

  return (
    <>
      <Button
        variant="outline"
        size="sm"
        className="gap-2 cursor-pointer bg-background/90 backdrop-blur-sm shadow-sm"
        onClick={() => setConfirmOpen(true)}
      >
        <LogOut className="size-4" />
        <span className="hidden lg:inline">{labels.leaveButton}</span>
      </Button>

      <ConfirmDialog
        open={confirmOpen}
        onOpenChange={setConfirmOpen}
        onConfirm={handleLeave}
        isPending={isPending}
        labels={{
          title: labels.dialogTitle,
          description: labels.dialogDesc,
          cancel: labels.cancel,
          confirmButton: labels.confirmButton,
        }}
      />
    </>
  );
}
