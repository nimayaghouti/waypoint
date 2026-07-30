'use client';

import {
  closestCorners,
  DndContext,
  DragEndEvent,
  DragOverEvent,
  KeyboardSensor,
  PointerSensor,
  useSensor,
  useSensors,
} from '@dnd-kit/core';
import { arrayMove, sortableKeyboardCoordinates } from '@dnd-kit/sortable';
import { useState, useTransition } from 'react';
import { toast } from 'sonner';

import { updateItineraryItemsAction } from '@/lib/actions/itinerary';

import ItineraryDayColumn from './ItineraryDayColumn';

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
  initialDays: DayProps[];
  locale: string;
  labels: Record<string, string>;
  valLabels: Record<string, string>;
  canEdit: boolean;
}

export default function ItineraryBoard({
  tripId,
  initialDays,
  locale,
  labels,
  valLabels,
  canEdit,
}: Props) {
  const [days, setDays] = useState(initialDays);
  const [prevDays, setPrevDays] = useState(initialDays);
  const [snapshot, setSnapshot] = useState(initialDays);

  const [, startTransition] = useTransition();

  if (initialDays !== prevDays) {
    setPrevDays(initialDays);
    setDays(initialDays);
  }

  const sensors = useSensors(
    useSensor(PointerSensor, { activationConstraint: { distance: 5 } }),
    useSensor(KeyboardSensor, {
      coordinateGetter: sortableKeyboardCoordinates,
    }),
  );

  const handleDragOver = (event: DragOverEvent) => {
    const { active, over } = event;
    if (!over) return;

    const activeId = active.id as string;
    const overId = over.id as string;

    const activeDayIndex = days.findIndex(d =>
      d.items.some(i => i.id === activeId),
    );
    const overDayIndex = days.findIndex(
      d => d.id === overId || d.items.some(i => i.id === overId),
    );

    if (
      activeDayIndex === -1 ||
      overDayIndex === -1 ||
      activeDayIndex === overDayIndex
    )
      return;

    setDays(prev => {
      const newDays = [...prev];
      const activeItems = [...newDays[activeDayIndex].items];
      const overItems = [...newDays[overDayIndex].items];

      const activeItemIndex = activeItems.findIndex(i => i.id === activeId);
      const activeItem = activeItems[activeItemIndex];

      activeItems.splice(activeItemIndex, 1);

      const overItemIndex =
        overId === newDays[overDayIndex].id
          ? overItems.length
          : overItems.findIndex(i => i.id === overId);

      overItems.splice(
        overItemIndex >= 0 ? overItemIndex : overItems.length,
        0,
        {
          ...activeItem,
          itineraryDayId: newDays[overDayIndex].id,
        },
      );

      newDays[activeDayIndex] = {
        ...newDays[activeDayIndex],
        items: activeItems,
      };
      newDays[overDayIndex] = { ...newDays[overDayIndex], items: overItems };
      return newDays;
    });
  };

  const handleDragStart = () => setSnapshot(days);

  const handleDragEnd = (event: DragEndEvent) => {
    const { active, over } = event;
    if (!over) {
      setDays(snapshot);
      return;
    }

    const activeId = active.id as string;
    const overId = over.id as string;

    const dayIndex = days.findIndex(d => d.items.some(i => i.id === activeId));
    if (dayIndex === -1) return;

    const newDays = [...days];
    const items = [...newDays[dayIndex].items];

    const oldIndex = items.findIndex(i => i.id === activeId);
    const newIndex = items.findIndex(i => i.id === overId);

    const reorderedItems = arrayMove(
      items,
      oldIndex,
      newIndex >= 0 ? newIndex : items.length - 1,
    ).map((item, index) => ({
      ...item,
      order: index,
    }));

    newDays[dayIndex] = { ...newDays[dayIndex], items: reorderedItems };

    setDays(newDays);

    startTransition(async () => {
      const payload = reorderedItems.map(i => ({
        id: i.id,
        itineraryDayId: i.itineraryDayId,
        order: i.order,
      }));
      const result = await updateItineraryItemsAction(tripId, payload);
      if (result && 'error' in result) {
        toast.error(labels.errorReorder);
        setDays(snapshot);
      }
    });
  };

  const handleDragCancel = () => setDays(snapshot);

  return (
    <DndContext
      id="itinerary-dnd"
      sensors={sensors}
      collisionDetection={closestCorners}
      onDragOver={handleDragOver}
      onDragEnd={handleDragEnd}
      onDragStart={handleDragStart}
      onDragCancel={handleDragCancel}
    >
      <div className="flex flex-col gap-10">
        {days.map(day => (
          <ItineraryDayColumn
            key={day.id}
            tripId={tripId}
            day={day}
            locale={locale}
            labels={labels}
            valLabels={valLabels}
            canEdit={canEdit}
          />
        ))}
      </div>
    </DndContext>
  );
}
