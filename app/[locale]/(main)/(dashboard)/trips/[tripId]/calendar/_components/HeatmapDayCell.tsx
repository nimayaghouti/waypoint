'use client';

import { CheckCircle2, HelpCircle, XCircle } from 'lucide-react';

import AvailabilityStatusPicker from '@/components/calendar/AvailabilityStatusPicker';
import {
  Popover,
  PopoverContent,
  PopoverTrigger,
} from '@/components/ui/popover';

import { CalendarLabels } from '@/lib/calendar-lib';
import { AvailabilityStatus } from '@/lib/generated/prisma/enums';
import { cn } from '@/lib/utils';

interface Props {
  dateKey: string;
  dayNumberLabel: string;
  isPast: boolean;
  isToday: boolean;
  isCurrentDisplayMonth: boolean;
  isSelected: boolean;
  isPending: boolean;
  selectionMode: boolean;
  isOpen: boolean;
  myStatus?: AvailabilityStatus | null;
  heatmapIntensity: number;
  labels: CalendarLabels;
  onDayClick: (dateKey: string, isPast: boolean) => void;
  onOpenChange: (open: boolean) => void;
  onSetStatus: (status: AvailabilityStatus | null) => void;
}

export default function HeatmapDayCell({
  dateKey,
  dayNumberLabel,
  isPast,
  isToday,
  isCurrentDisplayMonth,
  isSelected,
  isPending,
  selectionMode,
  isOpen,
  myStatus,
  heatmapIntensity,
  labels,
  onDayClick,
  onOpenChange,
  onSetStatus,
}: Props) {
  let bgClass = 'bg-background hover:bg-muted/50';

  if (heatmapIntensity > 0) {
    if (heatmapIntensity === 1) {
      bgClass = 'bg-emerald-500/80 hover:bg-emerald-500 text-white font-bold';
    } else if (heatmapIntensity >= 0.5) {
      bgClass = 'bg-emerald-500/40 hover:bg-emerald-500/60';
    } else {
      bgClass = 'bg-emerald-500/10 hover:bg-emerald-500/20';
    }
  }

  const dayButtonClassName = cn(
    'min-h-20 w-full p-2 flex flex-col items-center justify-between transition-colors',
    bgClass,
    !isCurrentDisplayMonth && 'opacity-40 grayscale',
    isPast
      ? 'cursor-not-allowed hover:bg-background opacity-50'
      : 'cursor-pointer',
    isPending && !isPast && 'pointer-events-none opacity-60',
    isToday && 'ring-2 ring-inset ring-primary/60',
    isSelected && 'ring-2 ring-inset ring-accent',
  );

  const dayInnerContent = (
    <>
      <span className="text-sm">{dayNumberLabel}</span>
      <div className="mt-1">
        {myStatus === 'AVAILABLE' && (
          <CheckCircle2 className="size-5 text-green-600 dark:text-green-300" />
        )}
        {myStatus === 'MAYBE' && (
          <HelpCircle className="size-5 text-amber-500" />
        )}
        {myStatus === 'UNAVAILABLE' && (
          <XCircle className="size-5 text-destructive" />
        )}
      </div>
    </>
  );

  if (isPast || selectionMode) {
    return (
      <button
        type="button"
        onClick={() => onDayClick(dateKey, isPast)}
        disabled={isPast}
        aria-pressed={isSelected}
        className={dayButtonClassName}
      >
        {dayInnerContent}
      </button>
    );
  }

  return (
    <Popover open={isOpen} onOpenChange={onOpenChange}>
      <PopoverTrigger asChild>
        <button
          type="button"
          onClick={() => onDayClick(dateKey, isPast)}
          className={dayButtonClassName}
        >
          {dayInnerContent}
        </button>
      </PopoverTrigger>
      <PopoverContent className="w-48 p-2" align="center">
        <AvailabilityStatusPicker
          currentStatus={myStatus ?? null}
          labels={labels}
          disabled={isPending}
          onSelect={onSetStatus}
        />
      </PopoverContent>
    </Popover>
  );
}
