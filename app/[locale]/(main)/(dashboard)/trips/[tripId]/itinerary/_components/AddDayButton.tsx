'use client';

import { Plus } from 'lucide-react';

import { useState, useTransition } from 'react';
import { toast } from 'sonner';

import { Button } from '@/components/ui/button';
import { DatePicker } from '@/components/ui/date-picker';
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from '@/components/ui/dialog';

import { addItineraryDayAction } from '@/lib/actions/itinerary';

interface Props {
  tripId: string;
  locale: string;
  labels: Record<string, string>;
  minDateKey: string;
}

export default function AddDayButton({
  tripId,
  locale,
  labels,
  minDateKey,
}: Props) {
  const [isOpen, setIsOpen] = useState(false);
  const [selectedDate, setSelectedDate] = useState('');
  const [isPending, startTransition] = useTransition();

  const handleAddDay = () => {
    if (!selectedDate) return;

    startTransition(async () => {
      const result = await addItineraryDayAction(tripId, selectedDate);
      if (result && 'error' in result) {
        toast.error(
          result.error === 'Server error' ||
            result.error === 'Unauthorized' ||
            result.error === 'Forbidden'
            ? labels.errorGeneric
            : result.error,
        );
      } else if (result && 'success' in result) {
        toast.success(labels.successDayAdded);
        setIsOpen(false);
        setSelectedDate('');
      }
    });
  };

  return (
    <Dialog open={isOpen} onOpenChange={setIsOpen}>
      <DialogTrigger asChild>
        <Button className="cursor-pointer gap-2 ms-auto">
          <Plus className="size-4" />
          {labels.addDay}
        </Button>
      </DialogTrigger>
      <DialogContent className="sm:max-w-md">
        <DialogHeader>
          <DialogTitle>{labels.addDay}</DialogTitle>
        </DialogHeader>
        <div className="flex flex-col gap-4 mt-4">
          <DatePicker
            value={selectedDate}
            onChange={setSelectedDate}
            locale={locale}
            placeholder={labels.selectDatePlaceholder}
            minDateKey={minDateKey}
            disabled={isPending}
            disablePastDays={true}
          />
          <Button
            onClick={handleAddDay}
            disabled={isPending || !selectedDate}
            className="w-full cursor-pointer"
          >
            {isPending ? '...' : labels.save}
          </Button>
        </div>
      </DialogContent>
    </Dialog>
  );
}
