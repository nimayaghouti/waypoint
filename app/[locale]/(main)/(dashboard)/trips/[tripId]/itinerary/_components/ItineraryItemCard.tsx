'use client';

import {
  Clock,
  GripVertical,
  Pencil,
  Trash2,
  TriangleAlert,
} from 'lucide-react';

import { useSortable } from '@dnd-kit/sortable';
import { CSS } from '@dnd-kit/utilities';
import { useState, useTransition } from 'react';
import { toast } from 'sonner';

import ConfirmDialog from '@/components/shared/ConfirmDialog';
import { Button } from '@/components/ui/button';
import { Card } from '@/components/ui/card';

import { deleteItineraryItemAction } from '@/lib/actions/itinerary';
import { toLocaleDigits } from '@/lib/calendar-lib';
import { cn } from '@/lib/utils';

import ItemModal from './ItemModal';

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
  item: ItemProps;
  locale: string;
  labels: Record<string, string>;
  valLabels: Record<string, string>;
  canEdit: boolean;
  isOutOfOrder?: boolean;
}

export default function ItineraryItemCard({
  tripId,
  dayId,
  item,
  locale,
  labels,
  valLabels,
  canEdit,
  isOutOfOrder,
}: Props) {
  const [confirmOpen, setConfirmOpen] = useState(false);
  const [isPending, startTransition] = useTransition();

  const {
    attributes,
    listeners,
    setNodeRef,
    transform,
    transition,
    isDragging,
  } = useSortable({ id: item.id, disabled: !canEdit });

  const style = {
    transform: CSS.Translate.toString(transform),
    transition,
  };

  const handleDelete = () => {
    startTransition(async () => {
      const result = await deleteItineraryItemAction(tripId, item.id);
      if (result && 'error' in result) toast.error(labels.errorDeleteItem);
      setConfirmOpen(false);
    });
  };

  return (
    <Card
      ref={setNodeRef}
      style={style}
      className={cn(
        'relative flex flex-col p-4 shadow-sm border-border/50 group transition-opacity',
        isDragging && 'opacity-50 scale-[1.02] shadow-md z-50',
        !isDragging && 'hover:shadow-md',
      )}
    >
      <div className="flex items-start gap-3">
        {canEdit && (
          <div
            {...attributes}
            {...listeners}
            className="mt-1 cursor-grab active:cursor-grabbing text-muted-foreground hover:text-foreground touch-none"
          >
            <GripVertical className="size-5" />
          </div>
        )}

        <div className="flex-1 flex flex-col gap-1.5 min-w-0">
          <div className="flex items-start justify-between gap-4">
            <div className="flex items-center gap-2 truncate">
              <h4 className="font-semibold text-base truncate">{item.title}</h4>
              {isOutOfOrder && (
                <span
                  title={labels.timeWarning}
                  className="shrink-0 flex items-center"
                >
                  <TriangleAlert className="size-4 text-amber-500" />
                </span>
              )}
            </div>

            {canEdit && (
              <div className="flex items-center gap-0.5 opacity-0 group-hover:opacity-100 transition-opacity shrink-0">
                <ItemModal
                  tripId={tripId}
                  dayId={dayId}
                  item={item}
                  locale={locale}
                  labels={labels}
                  valLabels={valLabels}
                  trigger={
                    <Button
                      variant="ghost"
                      size="icon"
                      className="size-7 text-muted-foreground hover:text-primary cursor-pointer"
                    >
                      <Pencil className="size-4" />
                    </Button>
                  }
                />
                <Button
                  variant="ghost"
                  size="icon"
                  onClick={() => setConfirmOpen(true)}
                  disabled={isPending}
                  className="size-7 text-muted-foreground hover:text-destructive cursor-pointer"
                >
                  <Trash2 className="size-4" />
                </Button>
              </div>
            )}
          </div>

          {(item.startTime || item.endTime) && (
            <div className="flex items-center gap-1.5 text-xs text-muted-foreground font-medium">
              <Clock className="size-3.5" />
              <span dir="ltr">
                {item.startTime
                  ? toLocaleDigits(item.startTime, locale)
                  : '--:--'}
                {' - '}
                {item.endTime ? toLocaleDigits(item.endTime, locale) : '--:--'}
              </span>
            </div>
          )}

          {item.notes && (
            <p className="text-sm text-muted-foreground bg-muted/30 p-2 rounded-md mt-1 line-clamp-3">
              {item.notes}
            </p>
          )}
        </div>
      </div>

      <ConfirmDialog
        open={confirmOpen}
        onOpenChange={setConfirmOpen}
        onConfirm={handleDelete}
        isPending={isPending}
        labels={{
          title: labels.deleteItem,
          description: labels.deleteItemConfirm,
          cancel: labels.cancel,
          confirmButton: labels.delete,
        }}
      />
    </Card>
  );
}
