'use client';

import { useMemo, useState, useTransition } from 'react';
import { toast } from 'sonner';

import CalendarHeader from '@/components/calendar/CalendarHeader';
import CalendarLegend from '@/components/calendar/CalendarLegend';
import SelectionActionBar from '@/components/calendar/SelectionActionBar';

import {
  bulkSetAvailabilityAction,
  setAvailabilityAction,
} from '@/lib/actions/availability';
import {
  CalendarLabels,
  getDateFns,
  getDateFnsLocale,
  getWeekStartsOn,
  toISODateKey,
  toLocaleDigits,
} from '@/lib/calendar-lib';
import { AvailabilityStatus } from '@/lib/generated/prisma/enums';

import HeatmapDayCell from './HeatmapDayCell';

interface AvailabilityData {
  id: string;
  userId: string;
  date: Date;
  status: AvailabilityStatus;
}

interface Props {
  tripId: string;
  currentUserId: string;
  totalMembers: number;
  availabilities: AvailabilityData[];
  labels: CalendarLabels;
  locale: string;
  todayDateString: string;
}

export default function HeatmapCalendar({
  tripId,
  currentUserId,
  totalMembers,
  availabilities,
  labels,
  locale,
  todayDateString,
}: Props) {
  const [currentMonth, setCurrentMonth] = useState(new Date());
  const [openDayKey, setOpenDayKey] = useState<string | null>(null);
  const [selectionMode, setSelectionMode] = useState(false);
  const [selectedDates, setSelectedDates] = useState<Set<string>>(new Set());
  const [isPending, startTransition] = useTransition();

  const dateFns = useMemo(() => getDateFns(locale), [locale]);
  const dateLocale = useMemo(() => getDateFnsLocale(locale), [locale]);
  const weekStartsOn = getWeekStartsOn(locale);

  const monthStart = dateFns.startOfMonth(currentMonth);
  const monthEnd = dateFns.endOfMonth(monthStart);
  const startDate = dateFns.startOfWeek(monthStart, { weekStartsOn });
  const endDate = dateFns.endOfWeek(monthEnd, { weekStartsOn });
  const calendarDays = dateFns.eachDayOfInterval({
    start: startDate,
    end: endDate,
  });

  const weekDaysLabels =
    locale === 'fa'
      ? ['ش', 'ی', 'د', 'س', 'چ', 'پ', 'ج']
      : ['Su', 'Mo', 'Tu', 'We', 'Th', 'Fr', 'Sa'];

  const monthTitle = toLocaleDigits(
    dateFns.format(currentMonth, 'MMMM yyyy', { locale: dateLocale }),
    locale,
  );

  const handleDayClick = (dateKey: string, isPast: boolean) => {
    if (isPast) return;
    if (selectionMode) {
      setSelectedDates(prev => {
        const next = new Set(prev);
        if (next.has(dateKey)) {
          next.delete(dateKey);
        } else {
          next.add(dateKey);
        }
        return next;
      });
      return;
    }
    setOpenDayKey(prev => (prev === dateKey ? null : dateKey));
  };

  const handleSetSingleStatus = (
    dateKey: string,
    status: AvailabilityStatus | null,
  ) => {
    startTransition(async () => {
      const result = await setAvailabilityAction(
        tripId,
        dateKey,
        status,
        locale,
      );
      if ('error' in result) toast.error(labels.errorUpdate);
      setOpenDayKey(null);
    });
  };

  const handleApplyBulkStatus = (status: AvailabilityStatus | null) => {
    const dates = Array.from(selectedDates);
    startTransition(async () => {
      const result = await bulkSetAvailabilityAction(
        tripId,
        dates,
        status,
        locale,
      );
      if ('error' in result) toast.error(labels.errorUpdate);
      setSelectedDates(new Set());
    });
  };

  return (
    <div className="flex flex-col w-full max-w-3xl mx-auto space-y-6">
      <CalendarHeader
        monthTitle={monthTitle}
        selectionMode={selectionMode}
        isPending={isPending}
        labels={labels}
        onToggleSelectionMode={() => {
          setSelectionMode(v => !v);
          setSelectedDates(new Set());
          setOpenDayKey(null);
        }}
        onPreviousMonth={() => setCurrentMonth(m => dateFns.subMonths(m, 1))}
        onNextMonth={() => setCurrentMonth(m => dateFns.addMonths(m, 1))}
      />

      <div className="border border-border/50 rounded-xl overflow-hidden bg-card shadow-sm">
        <div className="grid grid-cols-7 border-b border-border/50 bg-muted/30">
          {weekDaysLabels.map((day, i) => (
            <div
              key={i}
              className="py-3 text-center text-sm font-semibold text-muted-foreground"
            >
              {day}
            </div>
          ))}
        </div>

        <div className="grid grid-cols-7 bg-border/30 gap-px">
          {calendarDays.map(day => {
            const dateKey = toISODateKey(day);
            const isPast = dateKey < todayDateString;
            const dayAvailabilities = availabilities.filter(
              a => toISODateKey(new Date(a.date)) === dateKey,
            );
            const myStatus = dayAvailabilities.find(
              a => a.userId === currentUserId,
            )?.status;
            const availableCount = dayAvailabilities.filter(
              a => a.status === 'AVAILABLE',
            ).length;

            return (
              <HeatmapDayCell
                key={dateKey}
                dateKey={dateKey}
                dayNumberLabel={toLocaleDigits(
                  dateFns.format(day, 'd', { locale: dateLocale }),
                  locale,
                )}
                isPast={isPast}
                isToday={dateKey === todayDateString}
                isCurrentDisplayMonth={dateFns.isSameMonth(day, currentMonth)}
                isSelected={selectedDates.has(dateKey)}
                isPending={isPending}
                selectionMode={selectionMode}
                isOpen={openDayKey === dateKey}
                myStatus={myStatus}
                heatmapIntensity={
                  totalMembers > 0 ? availableCount / totalMembers : 0
                }
                labels={labels}
                onDayClick={handleDayClick}
                onOpenChange={open => setOpenDayKey(open ? dateKey : null)}
                onSetStatus={status => handleSetSingleStatus(dateKey, status)}
              />
            );
          })}
        </div>
      </div>

      <CalendarLegend labels={labels} />

      {selectionMode && (
        <SelectionActionBar
          count={selectedDates.size}
          disabled={isPending}
          labels={{
            ...labels,
            selectedCount: `${toLocaleDigits(String(selectedDates.size), locale)} ${labels.daysSelectedSuffix}`,
            cancel: labels.cancelSelection,
          }}
          onApply={handleApplyBulkStatus}
          onCancel={() => setSelectedDates(new Set())}
        />
      )}
    </div>
  );
}
