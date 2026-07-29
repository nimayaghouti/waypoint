'use client';

import { Plus } from 'lucide-react';

import { useState, useTransition } from 'react';
import { toast } from 'sonner';
import { z } from 'zod';

import { Button } from '@/components/ui/button';
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from '@/components/ui/dialog';
import { Input } from '@/components/ui/input';
import { TimePicker } from '@/components/ui/time-picker';

import {
  addItineraryItemAction,
  updateItineraryItemAction,
} from '@/lib/actions/itinerary';
import { getItinerarySchemas } from '@/lib/validations/itinerary';

interface ItemProps {
  id: string;
  title: string;
  startTime: string | null;
  endTime: string | null;
  notes: string | null;
}

interface Props {
  tripId: string;
  dayId: string;
  locale: string;
  labels: Record<string, string>;
  valLabels: Record<string, string>;
  item?: ItemProps;
  trigger?: React.ReactNode;
}

export default function ItemModal({
  tripId,
  dayId,
  locale,
  labels,
  valLabels,
  item,
  trigger,
}: Props) {
  const isEditMode = !!item;

  const [isOpen, setIsOpen] = useState(false);
  const [loading, setLoading] = useState(false);
  const [isPending, startTransition] = useTransition();
  const [errors, setErrors] = useState<Record<string, string[] | undefined>>(
    {},
  );

  const [title, setTitle] = useState(item?.title ?? '');
  const [startTime, setStartTime] = useState(item?.startTime ?? '');
  const [endTime, setEndTime] = useState(item?.endTime ?? '');
  const [notes, setNotes] = useState(item?.notes ?? '');

  const { AddItemSchema } = getItinerarySchemas(valLabels);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setErrors({});
    setLoading(true);

    const data = { title, startTime, endTime, notes };
    const clientValidation = AddItemSchema.safeParse(data);

    if (!clientValidation.success) {
      setErrors(z.flattenError(clientValidation.error).fieldErrors);
      setLoading(false);
      return;
    }

    const formData = new FormData();
    formData.append('title', data.title);
    formData.append('startTime', data.startTime || '');
    formData.append('endTime', data.endTime || '');
    formData.append('notes', data.notes || '');

    startTransition(async () => {
      const result = isEditMode
        ? await updateItineraryItemAction(tripId, item.id, formData)
        : await addItineraryItemAction(tripId, dayId, formData);

      if (result && 'fieldErrors' in result) {
        setErrors(result.fieldErrors as Record<string, string[]>);
      } else if (result && 'error' in result) {
        toast.error(
          result.error === 'Server error' ||
            result.error === 'Unauthorized' ||
            result.error === 'Forbidden'
            ? labels.errorGeneric
            : valLabels[result.error as string] || result.error,
        );
      } else if (result && 'success' in result) {
        toast.success(
          isEditMode ? labels.successItemUpdated : labels.successItemAdded,
        );
        setIsOpen(false);
        if (!isEditMode) {
          setTitle('');
          setStartTime('');
          setEndTime('');
          setNotes('');
        }
      }
      setLoading(false);
    });
  };

  const handleOpenChange = (open: boolean) => {
    if (open) {
      setTitle(item?.title ?? '');
      setStartTime(item?.startTime ?? '');
      setEndTime(item?.endTime ?? '');
      setNotes(item?.notes ?? '');
      setErrors({});
    }
    setIsOpen(open);
  };

  return (
    <Dialog open={isOpen} onOpenChange={handleOpenChange}>
      <DialogTrigger asChild>
        {trigger ?? (
          <Button
            variant="outline"
            className="w-full mt-4 border-dashed cursor-pointer gap-2"
          >
            <Plus className="size-4" />
            {labels.addItem}
          </Button>
        )}
      </DialogTrigger>
      <DialogContent className="sm:max-w-112.5">
        <DialogHeader>
          <DialogTitle>
            {isEditMode ? labels.editItem : labels.addItem}
          </DialogTitle>
        </DialogHeader>
        <form
          onSubmit={handleSubmit}
          className="flex flex-col gap-4 mt-2"
          noValidate
        >
          <div className="flex flex-col gap-2">
            <label className="text-sm font-medium">{labels.itemTitle}</label>
            <Input
              value={title}
              onChange={e => setTitle(e.target.value)}
              placeholder={labels.itemTitlePlaceholder}
              disabled={loading || isPending}
            />
            {errors.title && (
              <p className="text-xs font-bold text-destructive">
                {errors.title[0]}
              </p>
            )}
          </div>

          <div className="grid grid-cols-2 gap-4">
            <div className="flex flex-col gap-2">
              <label className="text-sm font-medium">{labels.startTime}</label>
              <TimePicker
                value={startTime}
                onChange={setStartTime}
                locale={locale}
                placeholder={labels.timePlaceholder}
                disabled={loading || isPending}
              />
              {errors.startTime && (
                <p className="text-xs font-bold text-destructive">
                  {errors.startTime[0]}
                </p>
              )}
            </div>
            <div className="flex flex-col gap-2">
              <label className="text-sm font-medium">{labels.endTime}</label>
              <TimePicker
                value={endTime}
                onChange={setEndTime}
                locale={locale}
                minTime={startTime}
                placeholder={labels.timePlaceholder}
                disabled={loading || isPending || !startTime}
              />
              {errors.endTime && (
                <p className="text-xs font-bold text-destructive">
                  {errors.endTime[0]}
                </p>
              )}
            </div>
          </div>

          <div className="flex flex-col gap-2">
            <label className="text-sm font-medium">{labels.notes}</label>
            <textarea
              value={notes}
              onChange={e => setNotes(e.target.value)}
              rows={3}
              className="flex w-full rounded-md border border-input bg-background px-3 py-2 text-sm ring-offset-background placeholder:text-muted-foreground focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 disabled:opacity-50"
              placeholder={labels.notesPlaceholder}
              disabled={loading || isPending}
            />
          </div>

          <Button
            type="submit"
            disabled={loading || isPending || !title.trim()}
            className="mt-2 cursor-pointer"
          >
            {loading || isPending ? '...' : labels.save}
          </Button>
        </form>
      </DialogContent>
    </Dialog>
  );
}
