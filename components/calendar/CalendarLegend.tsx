'use client';

import { CheckCircle2, HelpCircle, XCircle } from 'lucide-react';

import { CalendarLabels } from '@/lib/calendar-lib';

export default function CalendarLegend({ labels }: { labels: CalendarLabels }) {
  return (
    <div className="flex flex-wrap items-center justify-center gap-4 text-sm text-muted-foreground pt-4">
      <div className="flex items-center gap-1.5">
        <CheckCircle2 className="size-4 text-green-600" />{' '}
        {labels.statusAVAILABLE}
      </div>
      <div className="flex items-center gap-1.5">
        <HelpCircle className="size-4 text-amber-500" /> {labels.statusMAYBE}
      </div>
      <div className="flex items-center gap-1.5">
        <XCircle className="size-4 text-destructive" />{' '}
        {labels.statusUNAVAILABLE}
      </div>
      <div className="flex items-center gap-1.5">
        <div className="size-4 rounded-full border border-border" />{' '}
        {labels.statusNONE}
      </div>
    </div>
  );
}
