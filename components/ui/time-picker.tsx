'use client';

import { Clock } from 'lucide-react';

import { useEffect, useRef, useState } from 'react';

import { Button } from '@/components/ui/button';
import {
  Popover,
  PopoverContent,
  PopoverTrigger,
} from '@/components/ui/popover';

import { toLocaleDigits } from '@/lib/calendar-lib';
import { cn } from '@/lib/utils';

interface TimePickerProps {
  value: string;
  onChange: (time: string) => void;
  locale: string;
  minTime?: string;
  placeholder: string;
  disabled?: boolean;
  className?: string;
}

export function TimePicker({
  value,
  onChange,
  locale,
  minTime,
  placeholder,
  disabled,
  className,
}: TimePickerProps) {
  const [open, setOpen] = useState(false);

  const parsedHour = value ? parseInt(value.split(':')[0], 10) : undefined;
  const parsedMinute = value ? parseInt(value.split(':')[1], 10) : undefined;

  const minHour = minTime ? parseInt(minTime.split(':')[0], 10) : undefined;
  const minMinute = minTime ? parseInt(minTime.split(':')[1], 10) : undefined;

  const triggerLabel = value ? toLocaleDigits(value, locale) : placeholder;

  const hours = Array.from({ length: 24 }, (_, i) => i);
  const minutes = Array.from({ length: 60 }, (_, i) => i);

  const hourRef = useRef<HTMLButtonElement>(null);
  const minuteRef = useRef<HTMLButtonElement>(null);

  useEffect(() => {
    if (open) {
      const timer = setTimeout(() => {
        hourRef.current?.scrollIntoView({
          block: 'center',
          behavior: 'smooth',
        });
        minuteRef.current?.scrollIntoView({
          block: 'center',
          behavior: 'smooth',
        });
      }, 50);
      return () => clearTimeout(timer);
    }
  }, [open]);

  const handleHourClick = (h: number) => {
    const hStr = h.toString().padStart(2, '0');
    let m = parsedMinute !== undefined ? parsedMinute : 0;
    if (minHour !== undefined && minMinute !== undefined) {
      if (h === minHour && m < minMinute) {
        m = minMinute;
      }
    }
    const mStr = m.toString().padStart(2, '0');
    onChange(`${hStr}:${mStr}`);
  };

  const handleMinuteClick = (m: number) => {
    const mStr = m.toString().padStart(2, '0');
    const h =
      parsedHour !== undefined
        ? parsedHour
        : minHour !== undefined
          ? minHour
          : 0;
    const hStr = h.toString().padStart(2, '0');
    onChange(`${hStr}:${mStr}`);
  };

  return (
    <Popover open={open} onOpenChange={setOpen} modal={true}>
      <PopoverTrigger asChild>
        <Button
          type="button"
          variant="outline"
          disabled={disabled}
          className={cn(
            'w-full justify-start gap-2 font-normal cursor-pointer text-left',
            !value && 'text-muted-foreground',
            className,
          )}
        >
          <Clock className="size-4 shrink-0 opacity-60" />
          <span
            className="flex-1 text-center"
            dir={locale === 'fa' ? 'rtl' : 'ltr'}
          >
            {triggerLabel}
          </span>
        </Button>
      </PopoverTrigger>
      <PopoverContent className="w-40 p-0" align="center" dir="ltr">
        <div className="flex h-50 divide-x overflow-hidden">
          <div
            className="w-1/2 h-full overflow-y-auto overscroll-contain [&::-webkit-scrollbar]:hidden"
            style={{ scrollbarWidth: 'none' }}
          >
            <div className="flex flex-col p-2 gap-1">
              {hours.map(h => {
                const isDisabled = minHour !== undefined && h < minHour;
                const isSelected = parsedHour === h;
                return (
                  <button
                    key={`h-${h}`}
                    ref={isSelected ? hourRef : null}
                    type="button"
                    disabled={isDisabled}
                    onClick={() => handleHourClick(h)}
                    className={cn(
                      'h-8 rounded-md text-sm transition-colors shrink-0',
                      !isDisabled &&
                        'hover:bg-accent hover:text-accent-foreground cursor-pointer',
                      isSelected &&
                        'bg-primary text-primary-foreground hover:bg-primary hover:text-primary-foreground',
                      isDisabled &&
                        'cursor-not-allowed opacity-40 text-muted-foreground',
                    )}
                  >
                    {toLocaleDigits(h.toString().padStart(2, '0'), locale)}
                  </button>
                );
              })}
            </div>
          </div>

          <div
            className="w-1/2 h-full overflow-y-auto overscroll-contain [&::-webkit-scrollbar]:hidden"
            style={{ scrollbarWidth: 'none' }}
          >
            <div className="flex flex-col p-2 gap-1">
              {minutes.map(m => {
                const effectiveHour =
                  parsedHour !== undefined ? parsedHour : minHour;
                const isDisabled =
                  minHour !== undefined &&
                  minMinute !== undefined &&
                  effectiveHour === minHour &&
                  m < minMinute;
                const isSelected = parsedMinute === m;

                return (
                  <button
                    key={`m-${m}`}
                    ref={isSelected ? minuteRef : null}
                    type="button"
                    disabled={isDisabled}
                    onClick={() => handleMinuteClick(m)}
                    className={cn(
                      'h-8 rounded-md text-sm transition-colors shrink-0',
                      !isDisabled &&
                        'hover:bg-accent hover:text-accent-foreground cursor-pointer',
                      isSelected &&
                        'bg-primary text-primary-foreground hover:bg-primary hover:text-primary-foreground',
                      isDisabled &&
                        'cursor-not-allowed opacity-40 text-muted-foreground',
                    )}
                  >
                    {toLocaleDigits(m.toString().padStart(2, '0'), locale)}
                  </button>
                );
              })}
            </div>
          </div>
        </div>
      </PopoverContent>
    </Popover>
  );
}
