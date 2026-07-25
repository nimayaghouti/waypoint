'use client';

import { CalendarIcon, ChevronLeft, ChevronRight } from 'lucide-react';

import { useMemo, useState } from 'react';

import { Button } from '@/components/ui/button';
import {
  Popover,
  PopoverContent,
  PopoverTrigger,
} from '@/components/ui/popover';

import {
  getDateFns,
  getDateFnsLocale,
  getWeekdayLabels,
  getWeekStartsOn,
  toISODateKey,
  toLocaleDigits,
} from '@/lib/calendar-lib';
import { cn } from '@/lib/utils';

interface DatePickerProps {
  value: string;
  onChange: (dateKey: string) => void;
  locale: string;
  minDateKey?: string;
  placeholder: string;
  disabled?: boolean;
  className?: string;
  disablePastDays?: boolean;
  disablePastMonths?: boolean;
}

export function DatePicker({
  value,
  onChange,
  locale,
  minDateKey,
  placeholder,
  disabled,
  className,
  disablePastDays = true,
  disablePastMonths = true,
}: DatePickerProps) {
  const [open, setOpen] = useState(false);
  const [viewMonth, setViewMonth] = useState(() =>
    value ? new Date(`${value}T12:00:00Z`) : new Date(),
  );

  const dateFns = useMemo(() => getDateFns(locale), [locale]);
  const dateLocale = useMemo(() => getDateFnsLocale(locale), [locale]);
  const weekStartsOn = getWeekStartsOn(locale);
  const weekdayLabels = getWeekdayLabels(locale);

  const monthStart = dateFns.startOfMonth(viewMonth);
  const monthEnd = dateFns.endOfMonth(monthStart);
  const gridStart = dateFns.startOfWeek(monthStart, { weekStartsOn });
  const gridEnd = dateFns.endOfWeek(monthEnd, { weekStartsOn });
  const days = dateFns.eachDayOfInterval({ start: gridStart, end: gridEnd });

  const monthTitle = toLocaleDigits(
    dateFns.format(viewMonth, 'MMMM yyyy', { locale: dateLocale }),
    locale,
  );

  const triggerLabel = value
    ? toLocaleDigits(
        dateFns.format(new Date(`${value}T12:00:00Z`), 'd MMMM yyyy', {
          locale: dateLocale,
        }),
        locale,
      )
    : placeholder;

  const handleSelectDay = (dateKey: string) => {
    onChange(dateKey);
    setOpen(false);
  };

  const todayKey = useMemo(() => toISODateKey(new Date()), []);

  const effectiveMinDateKey =
    minDateKey || (disablePastDays ? todayKey : undefined);

  const isPrevMonthDisabled = useMemo(() => {
    if (!disablePastMonths) return false;

    const baseDate = effectiveMinDateKey
      ? new Date(`${effectiveMinDateKey}T12:00:00Z`)
      : new Date();

    const viewMonthStart = dateFns.startOfMonth(viewMonth);
    const baseMonthStart = dateFns.startOfMonth(baseDate);

    return viewMonthStart.getTime() <= baseMonthStart.getTime();
  }, [disablePastMonths, effectiveMinDateKey, viewMonth, dateFns]);

  return (
    <Popover open={open} onOpenChange={setOpen}>
      <PopoverTrigger asChild>
        <Button
          type="button"
          variant="outline"
          disabled={disabled}
          className={cn(
            'w-full justify-start gap-2 font-normal cursor-pointer',
            !value && 'text-muted-foreground',
            className,
          )}
        >
          <CalendarIcon className="size-4 shrink-0 opacity-60" />
          <span
            className="flex-1 text-center"
            dir={locale === 'fa' ? 'rtl' : 'ltr'}
          >
            {triggerLabel}
          </span>
        </Button>
      </PopoverTrigger>
      <PopoverContent className="w-72 p-3" align="start">
        <div className="flex items-center justify-between mb-3">
          <span className="text-sm font-semibold">{monthTitle}</span>
          <div className="flex items-center gap-1">
            <Button
              type="button"
              variant="ghost"
              size="icon"
              disabled={isPrevMonthDisabled}
              className={cn('size-7', !isPrevMonthDisabled && 'cursor-pointer')}
              onClick={() => setViewMonth(m => dateFns.subMonths(m, 1))}
            >
              <ChevronLeft className="size-4 rtl:rotate-180" />
            </Button>
            <Button
              type="button"
              variant="ghost"
              size="icon"
              className="size-7 cursor-pointer"
              onClick={() => setViewMonth(m => dateFns.addMonths(m, 1))}
            >
              <ChevronRight className="size-4 rtl:rotate-180" />
            </Button>
          </div>
        </div>

        <div className="grid grid-cols-7 gap-1 mb-1">
          {weekdayLabels.map((d, i) => (
            <div
              key={i}
              className="text-center text-xs text-muted-foreground font-medium"
            >
              {d}
            </div>
          ))}
        </div>

        <div className="grid grid-cols-7 gap-1">
          {days.map(day => {
            const dateKey = toISODateKey(day);
            const isDayDisabled = effectiveMinDateKey
              ? dateKey < effectiveMinDateKey
              : false;
            const isSelected = dateKey === value;
            const isCurrentMonth = dateFns.isSameMonth(day, viewMonth);

            return (
              <button
                key={dateKey}
                type="button"
                disabled={isDayDisabled}
                onClick={() => handleSelectDay(dateKey)}
                className={cn(
                  'h-8 rounded-md text-sm transition-colors',
                  !isDayDisabled &&
                    'hover:cursor-pointer hover:bg-accent hover:text-accent-foreground',
                  !isCurrentMonth &&
                    !isDayDisabled &&
                    'text-muted-foreground/70',
                  isSelected &&
                    'bg-primary text-primary-foreground hover:bg-primary hover:text-primary-foreground',
                  isDayDisabled &&
                    'cursor-not-allowed text-muted-foreground opacity-40 hover:bg-transparent hover:text-muted-foreground',
                )}
              >
                {toLocaleDigits(
                  dateFns.format(day, 'd', { locale: dateLocale }),
                  locale,
                )}
              </button>
            );
          })}
        </div>
      </PopoverContent>
    </Popover>
  );
}
