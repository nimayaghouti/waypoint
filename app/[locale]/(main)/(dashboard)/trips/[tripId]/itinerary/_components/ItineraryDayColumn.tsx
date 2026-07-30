'use client';

import { ArrowUpDown, Calendar, Trash2 } from 'lucide-react';

import { useDroppable } from '@dnd-kit/core';
import {
  SortableContext,
  verticalListSortingStrategy,
} from '@dnd-kit/sortable';
import { useMemo, useState, useTransition } from 'react';
import { toast } from 'sonner';

import ConfirmDialog from '@/components/shared/ConfirmDialog';
import { Button } from '@/components/ui/button';

import {
  deleteItineraryDayAction,
  updateItineraryItemsAction,
} from '@/lib/actions/itinerary';
import {
  getDateFns,
  getDateFnsLocale,
  toDisplaySafeDate,
  toLocaleDigits,
} from '@/lib/calendar-lib';

import ItemModal from './ItemModal';
import ItineraryItemCard from './ItineraryItemCard';

interface ItemProps {
  id: string;
  title: string;
  startTime: string | null;
  endTime: string | null;
  notes: string | null;
  order: number;
  itineraryDayId: string;
}

interface DayProps {
  id: string;
  date: Date;
  items: ItemProps[];
}

interface Props {
  tripId: string;
  day: DayProps;
  locale: string;
  labels: Record<string, string>;
  valLabels: Record<string, string>;
  canEdit: boolean;
}

export default function ItineraryDayColumn({
  tripId,
  day,
  locale,
  labels,
  valLabels,
  canEdit,
}: Props) {
  const [confirmOpen, setConfirmOpen] = useState(false);

  const [isPending, startTransition] = useTransition();
  const { setNodeRef } = useDroppable({ id: day.id });

  const dateFns = useMemo(() => getDateFns(locale), [locale]);
  const dateLocale = useMemo(() => getDateFnsLocale(locale), [locale]);

  const displayDate = toDisplaySafeDate(new Date(day.date));
  const formattedDate = toLocaleDigits(
    dateFns.format(displayDate, 'EEEE, d MMMM yyyy', { locale: dateLocale }),
    locale,
  );

  const handleDeleteDay = () => {
    startTransition(async () => {
      const result = await deleteItineraryDayAction(tripId, day.id);
      if (result && 'error' in result) toast.error(labels.errorDeleteDay);
      setConfirmOpen(false);
    });
  };

  const handleSortByTime = () => {
    startTransition(async () => {
      const sortedItems = [...day.items].sort((a, b) => {
        if (!a.startTime) return 1;
        if (!b.startTime) return -1;
        return a.startTime.localeCompare(b.startTime);
      });

      const payload = sortedItems
        .map((item, index) => ({
          id: item.id,
          itineraryDayId: day.id,
          order: index,
        }))
        .filter((item, index) => item.id !== day.items[index].id);

      if (payload.length === 0) return;

      const result = await updateItineraryItemsAction(tripId, payload);
      if (result && 'error' in result) toast.error(labels.errorSortItems);
    });
  };

  return (
    <div className="flex flex-col" ref={setNodeRef}>
      <div className="flex items-center justify-between mb-4">
        <div className="flex items-center gap-2 text-primary font-bold">
          <Calendar className="size-5" />
          <h3 className="text-lg">{formattedDate}</h3>
        </div>

        {canEdit && (
          <div className="flex items-center gap-2">
            {day.items.length > 1 && (
              <Button
                variant="ghost"
                size="sm"
                onClick={handleSortByTime}
                disabled={isPending}
                className="text-muted-foreground cursor-pointer gap-1.5 h-8"
              >
                <ArrowUpDown className="size-4" />
                <span className="hidden sm:inline">{labels.sortByTime}</span>
              </Button>
            )}
            <Button
              variant="ghost"
              size="icon"
              onClick={() => setConfirmOpen(true)}
              disabled={isPending}
              className="text-muted-foreground hover:text-destructive cursor-pointer h-8 w-8"
            >
              <Trash2 className="size-4" />
            </Button>
          </div>
        )}
      </div>

      <div className="ms-2.5 ps-6 border-s-2 border-border/50 flex flex-col gap-4 relative min-h-12.5">
        <SortableContext
          items={day.items.map(i => i.id)}
          strategy={verticalListSortingStrategy}
        >
          {day.items.map((item, index) => {
            let isOutOfOrder = false;
            if (item.startTime) {
              const prevItem = [...day.items]
                .slice(0, index)
                .reverse()
                .find(i => i.startTime);
              if (
                prevItem &&
                prevItem.startTime &&
                item.startTime < prevItem.startTime
              ) {
                isOutOfOrder = true;
              }
            }

            return (
              <ItineraryItemCard
                key={item.id}
                tripId={tripId}
                dayId={day.id}
                item={item}
                locale={locale}
                labels={labels}
                valLabels={valLabels}
                canEdit={canEdit}
                isOutOfOrder={isOutOfOrder}
              />
            );
          })}
        </SortableContext>

        {canEdit && (
          <ItemModal
            tripId={tripId}
            dayId={day.id}
            locale={locale}
            labels={labels}
            valLabels={valLabels}
          />
        )}

        <ConfirmDialog
          open={confirmOpen}
          onOpenChange={setConfirmOpen}
          onConfirm={handleDeleteDay}
          isPending={isPending}
          labels={{
            title: labels.deleteDay,
            description: labels.deleteDayConfirm,
            cancel: labels.cancel,
            confirmButton: labels.delete,
          }}
        />
      </div>
    </div>
  );
}
