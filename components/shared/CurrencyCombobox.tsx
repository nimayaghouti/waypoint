'use client';

import { Check, ChevronsUpDown } from 'lucide-react';

import { useMemo, useState } from 'react';

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

const currencies = Intl.supportedValuesOf('currency');

interface Props {
  value: string;
  onChange: (value: string) => void;
  locale: string;
  disabled?: boolean;
  labels: {
    placeholder: string;
    search: string;
    noResult: string;
  };
}

export function CurrencyCombobox({
  value,
  onChange,
  locale,
  disabled,
  labels,
}: Props) {
  const [open, setOpen] = useState(false);

  const currencyOptions = useMemo(() => {
    const displayNames = new Intl.DisplayNames([locale], { type: 'currency' });
    return currencies.map(code => ({
      code,
      name: `${code} - ${displayNames.of(code) || code}`,
    }));
  }, [locale]);

  const selectedCurrency = currencyOptions.find(c => c.code === value);

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
          {selectedCurrency ? selectedCurrency.name : labels.placeholder}
          <ChevronsUpDown className="ms-2 h-4 w-4 shrink-0 opacity-50" />
        </Button>
      </PopoverTrigger>
      <PopoverContent className="w-56 max-h-64 p-0" align="start">
        <Command>
          <CommandInput placeholder={labels.search} />
          <CommandList>
            <CommandEmpty>{labels.noResult}</CommandEmpty>
            <CommandGroup>
              {currencyOptions.map(curr => (
                <CommandItem
                  key={curr.code}
                  value={curr.name}
                  onSelect={() => {
                    onChange(curr.code);
                    setOpen(false);
                  }}
                  className="cursor-pointer"
                >
                  <Check
                    className={cn(
                      'mr-2 h-4 w-4',
                      value === curr.code ? 'opacity-100' : 'opacity-0',
                    )}
                  />
                  <span className="truncate">{curr.name}</span>
                </CommandItem>
              ))}
            </CommandGroup>
          </CommandList>
        </Command>
      </PopoverContent>
    </Popover>
  );
}
