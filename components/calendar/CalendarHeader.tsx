'use client';

import { ChevronLeft, ChevronRight, ListChecks } from 'lucide-react';

import { Button } from '@/components/ui/button';

import { CalendarLabels } from '@/lib/calendar-lib';

interface Props {
  monthTitle: string;
  selectionMode: boolean;
  isPending: boolean;
  labels: CalendarLabels;
  onToggleSelectionMode: () => void;
  onPreviousMonth: () => void;
  onNextMonth: () => void;
}

export default function CalendarHeader({
  monthTitle,
  selectionMode,
  isPending,
  labels,
  onToggleSelectionMode,
  onPreviousMonth,
  onNextMonth,
}: Props) {
  return (
    <div className="flex flex-wrap items-center justify-between gap-2">
      <h2 className="text-xl font-bold">{monthTitle}</h2>
      <div className="flex items-center gap-2">
        <Button
          variant={selectionMode ? 'default' : 'outline'}
          size="sm"
          onClick={onToggleSelectionMode}
          className="gap-1.5"
        >
          <ListChecks className="size-4" />
          {selectionMode ? labels.exitSelectMode : labels.selectMultiple}
        </Button>
        <Button
          variant="outline"
          size="icon"
          onClick={onPreviousMonth}
          disabled={isPending}
        >
          <ChevronLeft className="size-4 rtl:rotate-180" />
        </Button>
        <Button
          variant="outline"
          size="icon"
          onClick={onNextMonth}
          disabled={isPending}
        >
          <ChevronRight className="size-4 rtl:rotate-180" />
        </Button>
      </div>
    </div>
  );
}
