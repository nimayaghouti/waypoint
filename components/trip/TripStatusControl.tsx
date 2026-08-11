'use client';

import { useTransition } from 'react';
import { toast } from 'sonner';

import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';

import { updateTripStatusAction } from '@/lib/actions/trip';

type TripStatus = 'PLANNING' | 'CONFIRMED' | 'COMPLETED' | 'ARCHIVED';

const ALL_STATUSES: TripStatus[] = [
  'PLANNING',
  'CONFIRMED',
  'COMPLETED',
  'ARCHIVED',
];

const STATUS_STYLES: Record<TripStatus, string> = {
  PLANNING: 'bg-muted/50 border-border text-muted-foreground',
  CONFIRMED: 'bg-primary/10 border-primary/30 text-primary',
  COMPLETED: 'bg-primary/20 border-primary/40 text-primary',
  ARCHIVED: 'bg-destructive/10 border-destructive/30 text-destructive',
};

interface Props {
  tripId: string;
  status: TripStatus;
  canEdit: boolean;
  labels: Record<string, string>;
}

export default function TripStatusControl({
  tripId,
  status,
  canEdit,
  labels,
}: Props) {
  const [isPending, startTransition] = useTransition();

  if (!canEdit) {
    return (
      <span
        className={`text-xs font-medium px-2.5 py-1 rounded-full border backdrop-blur-sm shadow-sm ${STATUS_STYLES[status]}`}
      >
        {labels[`status${status}`]}
      </span>
    );
  }

  const handleChange = (value: string) => {
    startTransition(async () => {
      const result = await updateTripStatusAction(tripId, value as TripStatus);
      if (result?.error) {
        toast.error(labels.errorGeneric);
      } else {
        toast.success(labels.success);
      }
    });
  };

  return (
    <Select value={status} onValueChange={handleChange} disabled={isPending}>
      <SelectTrigger className="w-fit h-8 cursor-pointer gap-1.5 text-xs bg-background/90 backdrop-blur-sm shadow-sm">
        <SelectValue />
      </SelectTrigger>
      <SelectContent>
        {ALL_STATUSES.map(s => (
          <SelectItem key={s} value={s} className="cursor-pointer">
            {labels[`status${s}`]}
          </SelectItem>
        ))}
      </SelectContent>
    </Select>
  );
}
