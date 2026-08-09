'use client';

import { Check, ChevronsUpDown } from 'lucide-react';

import { useState } from 'react';

import { Button } from '@/components/ui/button';
import {
  Command,
  CommandEmpty,
  CommandGroup,
  CommandInput,
  CommandItem,
  CommandList,
} from '@/components/ui/command';
import {
  Popover,
  PopoverContent,
  PopoverTrigger,
} from '@/components/ui/popover';

import { cn } from '@/lib/utils';

const timezones = ['UTC', ...Intl.supportedValuesOf('timeZone')];

interface Props {
  value: string;
  onChange: (value: string) => void;
  disabled?: boolean;
  labels: {
    placeholder: string;
    search: string;
    noResult: string;
  };
}

export function TimezoneCombobox({ value, onChange, disabled, labels }: Props) {
  const [open, setOpen] = useState(false);

  return (
    <Popover open={open} onOpenChange={setOpen} modal={true}>
      <PopoverTrigger asChild>
        <Button
          variant="outline"
          role="combobox"
          aria-expanded={open}
          className="w-full justify-between font-normal text-left truncate cursor-pointer"
          disabled={disabled}
        >
          {value || labels.placeholder}
          <ChevronsUpDown className="ms-2 h-4 w-4 shrink-0 opacity-50" />
        </Button>
      </PopoverTrigger>
      <PopoverContent className="w-56 max-h-64 p-0" align="start">
        <Command>
          <CommandInput placeholder={labels.search} />
          <CommandList>
            <CommandEmpty>{labels.noResult}</CommandEmpty>
            <CommandGroup>
              {timezones.map(tz => (
                <CommandItem
                  key={tz}
                  value={tz}
                  onSelect={currentValue => {
                    const realTz =
                      timezones.find(t => t.toLowerCase() === currentValue) ||
                      tz;
                    onChange(realTz);
                    setOpen(false);
                  }}
                  className="cursor-pointer"
                >
                  <Check
                    className={cn(
                      'mr-2 h-4 w-4',
                      value === tz ? 'opacity-100' : 'opacity-0',
                    )}
                  />
                  <span className="truncate">{tz}</span>
                </CommandItem>
              ))}
            </CommandGroup>
          </CommandList>
        </Command>
      </PopoverContent>
    </Popover>
  );
}
