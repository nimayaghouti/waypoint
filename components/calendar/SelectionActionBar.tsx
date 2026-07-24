'use client';

import { X } from 'lucide-react';

import AvailabilityStatusPicker from '@/components/calendar/AvailabilityStatusPicker';
import { Button } from '@/components/ui/button';

import { AvailabilityStatus } from '@/lib/generated/prisma/enums';

interface Props {
  count: number;
  labels: {
    statusAVAILABLE: string;
    statusMAYBE: string;
    statusUNAVAILABLE: string;
    statusNONE: string;
    selectedCount: string;
    cancel: string;
  };
  disabled?: boolean;
  onApply: (status: AvailabilityStatus | null) => void;
  onCancel: () => void;
}

export default function SelectionActionBar({
  count,
  labels,
  disabled,
  onApply,
  onCancel,
}: Props) {
  if (count === 0) return null;

  return (
    <div className="sticky bottom-4 z-10 mx-auto flex w-full max-w-md flex-col gap-3 rounded-xl border border-border bg-card p-4 shadow-lg">
      <div className="flex items-center justify-between">
        <span className="text-sm font-medium">{labels.selectedCount}</span>
        <Button
          variant="ghost"
          size="icon"
          className="size-7"
          onClick={onCancel}
          aria-label={labels.cancel}
        >
          <X className="size-4" />
        </Button>
      </div>
      <AvailabilityStatusPicker
        labels={labels}
        disabled={disabled}
        onSelect={onApply}
      />
    </div>
  );
}
