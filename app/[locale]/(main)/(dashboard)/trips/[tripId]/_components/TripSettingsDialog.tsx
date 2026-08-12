'use client';

import { Loader2, Settings } from 'lucide-react';

import { useState, useTransition } from 'react';
import { toast } from 'sonner';

import { CurrencyCombobox } from '@/components/shared/CurrencyCombobox';
import { TimezoneCombobox } from '@/components/shared/TimezoneCombobox';
import { Button } from '@/components/ui/button';
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from '@/components/ui/dialog';

import { updateTripSettingsAction } from '@/lib/actions/trip';

interface Props {
  tripId: string;
  initialTimezone: string;
  initialCurrency: string;
  locale: string;
  labels: Record<string, string>;
}

export default function TripSettingsDialog({
  tripId,
  initialTimezone,
  initialCurrency,
  locale,
  labels,
}: Props) {
  const [isOpen, setIsOpen] = useState(false);
  const [isPending, startTransition] = useTransition();

  const [timezone, setTimezone] = useState(initialTimezone);
  const [currency, setCurrency] = useState(initialCurrency);

  const handleSave = () => {
    startTransition(async () => {
      const result = await updateTripSettingsAction(tripId, {
        timezone,
        currency,
      });
      if (result.error) {
        toast.error(labels.errorGeneric);
      } else {
        toast.success(labels.success);
        setIsOpen(false);
      }
    });
  };

  return (
    <Dialog open={isOpen} onOpenChange={setIsOpen}>
      <DialogTrigger asChild>
        <Button
          variant="outline"
          size="sm"
          className="gap-2 cursor-pointer bg-background/90 backdrop-blur-sm shadow-sm"
        >
          <Settings className="size-4" />
          <span className="hidden lg:inline">{labels.settingsButton}</span>
        </Button>
      </DialogTrigger>
      <DialogContent className="sm:max-w-md">
        <DialogHeader>
          <DialogTitle>{labels.dialogTitle}</DialogTitle>
          <DialogDescription>{labels.dialogDesc}</DialogDescription>
        </DialogHeader>

        <div className="flex flex-col gap-6 mt-4">
          <div className="flex flex-col gap-2">
            <label className="text-sm font-medium">
              {labels.timezoneLabel}
            </label>
            <TimezoneCombobox
              value={timezone}
              onChange={setTimezone}
              disabled={isPending}
              labels={{
                placeholder: labels.timezoneLabel,
                search: labels.searchTimezone,
                noResult: labels.noResult,
              }}
            />
          </div>

          <div className="flex flex-col gap-2">
            <label className="text-sm font-medium">
              {labels.currencyLabel}
            </label>
            <CurrencyCombobox
              value={currency}
              onChange={setCurrency}
              locale={locale}
              disabled={isPending}
              labels={{
                placeholder: labels.currencyLabel,
                search: labels.searchCurrency,
                noResult: labels.noResult,
              }}
            />
          </div>

          <Button
            onClick={handleSave}
            disabled={isPending}
            aria-label={isPending ? labels.saving : undefined}
            className="w-full cursor-pointer mt-2"
          >
            {isPending ? (
              <Loader2 className="size-4 animate-spin" />
            ) : (
              labels.save
            )}
          </Button>
        </div>
      </DialogContent>
    </Dialog>
  );
}
