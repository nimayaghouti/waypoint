'use client';

import { usePathname, useSearchParams } from 'next/navigation';

import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
} from '@/components/ui/dialog';

import CreateTripForm from './CreateTripForm';

interface Props {
  labels: Record<string, string>;
  valLabels: Record<string, string>;
}

export function CreateTripModal({ labels, valLabels }: Props) {
  const searchParams = useSearchParams();
  const pathname = usePathname();

  const isOpen = searchParams.get('action') === 'new';

  const handleOpenChange = (open: boolean) => {
    if (!open) {
      window.history.pushState(null, '', pathname);
    }
  };

  return (
    <Dialog open={isOpen} onOpenChange={handleOpenChange}>
      <DialogContent className="sm:max-w-125">
        <DialogHeader>
          <DialogTitle className="text-2xl font-bold">
            {labels.title}
          </DialogTitle>
          <DialogDescription>{labels.description}</DialogDescription>
        </DialogHeader>
        <div className="mt-2">
          <CreateTripForm
            labels={labels}
            valLabels={valLabels}
            onSuccess={() => handleOpenChange(false)}
          />
        </div>
      </DialogContent>
    </Dialog>
  );
}
