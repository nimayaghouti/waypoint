'use client';

import { MapPin, Plus, Trash2 } from 'lucide-react';

import { useRef, useState, useTransition } from 'react';
import { toast } from 'sonner';
import { z } from 'zod';

import PlaceBadge from '@/components/places/PlaceBadge';
import PlacePickerPopover, {
  PickablePlace,
} from '@/components/places/PlacePickerPopover';
import { Button } from '@/components/ui/button';
import { DatePicker } from '@/components/ui/date-picker';
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from '@/components/ui/dialog';
import { Input } from '@/components/ui/input';
import { ScrollArea } from '@/components/ui/scroll-area';
import { Switch } from '@/components/ui/switch';
import { TimePicker } from '@/components/ui/time-picker';

import { createPollAction } from '@/lib/actions/poll';
import { zonedTimeToUtc } from '@/lib/date-helpers';
import { cn } from '@/lib/utils';
import { getPollSchemas } from '@/lib/validations/poll';

interface Props {
  tripId: string;
  locale: string;
  tripTimezone: string;
  labels: Record<string, string>;
  valLabels: Record<string, string>;
  savedPlaces: PickablePlace[];
  pickerLabels: Record<string, string>;
}

interface CommittedOption {
  id: number;
  value: string;
  place: PickablePlace | null;
}

function getMinClosesAt() {
  const d = new Date(Date.now() + 5 * 60 * 1000);
  d.setSeconds(0, 0);
  d.setMinutes(d.getMinutes() - d.getTimezoneOffset());
  return d.toISOString().slice(0, 16);
}

export default function CreatePollModal({
  tripId,
  locale,
  tripTimezone,
  labels,
  valLabels,
  savedPlaces,
  pickerLabels,
}: Props) {
  const [isOpen, setIsOpen] = useState(false);
  const [loading, setLoading] = useState(false);
  const [isPending, startTransition] = useTransition();
  const [errors, setErrors] = useState<Record<string, string[] | undefined>>(
    {},
  );

  const [question, setQuestion] = useState('');
  const [isMulti, setIsMulti] = useState(false);
  const [closesAt, setClosesAt] = useState('');

  const [options, setOptions] = useState<CommittedOption[]>([]);
  const [draftValue, setDraftValue] = useState('');
  const [draftPlace, setDraftPlace] = useState<PickablePlace | null>(null);
  const [isDraftFocused, setIsDraftFocused] = useState(false);

  const draftInputRef = useRef<HTMLInputElement>(null);

  const { CreatePollSchema } = getPollSchemas(valLabels);

  const closesDateKey = closesAt ? closesAt.slice(0, 10) : '';
  const closesTime = closesAt ? closesAt.slice(11, 16) : '';
  const minClosesAt = getMinClosesAt();
  const minDateKey = minClosesAt.slice(0, 10);
  const minTime =
    closesDateKey === minDateKey ? minClosesAt.slice(11, 16) : undefined;

  const canCommitDraft = draftValue.trim().length > 0 || Boolean(draftPlace);

  const isBadgeInsideInput =
    Boolean(draftPlace) && draftValue.trim().length === 0 && !isDraftFocused;

  const handleDateChange = (dateKey: string) => {
    const effectiveMinTimeForDate =
      dateKey === minDateKey ? minClosesAt.slice(11, 16) : undefined;

    let nextTime = closesTime;
    if (!nextTime) {
      nextTime = effectiveMinTimeForDate ?? '12:00';
    } else if (effectiveMinTimeForDate && nextTime < effectiveMinTimeForDate) {
      nextTime = effectiveMinTimeForDate;
    }

    setClosesAt(`${dateKey}T${nextTime}`);
  };

  const handleTimeChange = (time: string) => {
    setClosesAt(`${closesDateKey || minDateKey}T${time}`);
  };

  const handleCommitDraft = () => {
    if (!canCommitDraft) return;
    setOptions(prev => [
      ...prev,
      { id: Date.now(), value: draftValue.trim(), place: draftPlace },
    ]);
    setDraftValue('');
    setDraftPlace(null);
    draftInputRef.current?.focus();
  };

  const handleDraftKeyDown = (e: React.KeyboardEvent<HTMLInputElement>) => {
    if (e.key === 'Enter') {
      e.preventDefault();
      handleCommitDraft();
    }
  };

  const handleRemoveOption = (id: number) => {
    setOptions(prev => prev.filter(opt => opt.id !== id));
  };

  const resetForm = () => {
    setQuestion('');
    setIsMulti(false);
    setClosesAt('');
    setOptions([]);
    setDraftValue('');
    setDraftPlace(null);
  };

  const handleSubmit = async (e: React.SubmitEvent) => {
    e.preventDefault();
    setErrors({});
    setLoading(true);

    let closesAtUtcIso = '';
    if (closesDateKey && closesTime) {
      const exactUtcDate = zonedTimeToUtc(
        closesDateKey,
        closesTime,
        tripTimezone,
      );
      closesAtUtcIso = exactUtcDate.toISOString();
    }

    const preparedOptions = options.map(opt => ({
      value: opt.value,
      placeId: opt.place?.id ?? null,
    }));

    const data = {
      question,
      type: isMulti ? 'MULTI' : 'SINGLE',
      options: preparedOptions,
      closesAt: closesAtUtcIso,
    };

    const clientValidation = CreatePollSchema.safeParse(data);
    if (!clientValidation.success) {
      setErrors(z.flattenError(clientValidation.error).fieldErrors);
      setLoading(false);
      return;
    }

    const formData = new FormData();
    formData.append('question', data.question);
    formData.append('type', data.type);
    formData.append('closesAt', data.closesAt);

    startTransition(async () => {
      const result = await createPollAction(
        tripId,
        formData,
        JSON.stringify(data.options),
      );

      if (result?.fieldErrors) {
        setErrors(result.fieldErrors);
      } else if (result?.error) {
        toast.error('An error occurred.');
      } else if (result?.success) {
        toast.success(labels.successToast);
        setIsOpen(false);
        resetForm();
      }
      setLoading(false);
    });
  };

  return (
    <Dialog open={isOpen} onOpenChange={setIsOpen}>
      <DialogTrigger asChild>
        <Button className="cursor-pointer gap-2 ms-auto">
          <Plus className="size-4" />
          {labels.newPollButton}
        </Button>
      </DialogTrigger>
      <DialogContent className="sm:max-w-md max-h-[90vh] overflow-y-auto gap-0 px-0">
        <DialogHeader className="px-4 pb-4">
          <DialogTitle>{labels.createTitle}</DialogTitle>
          <DialogDescription>{labels.createDesc}</DialogDescription>
        </DialogHeader>

        <ScrollArea
          className="px-2"
          viewportProps={{ className: 'h-auto! max-h-[60vh]' }}
        >
          <form
            id="create-poll-form"
            onSubmit={handleSubmit}
            className="flex flex-col gap-6 mt-4 px-2"
            noValidate
          >
            <div className="flex flex-col gap-2">
              <label className="text-sm font-medium">
                {labels.questionLabel}
              </label>
              <Input
                value={question}
                onChange={e => setQuestion(e.target.value)}
                placeholder={labels.questionPlaceholder}
                disabled={loading || isPending}
              />
              {errors.question && (
                <p className="text-xs font-bold text-destructive">
                  {errors.question[0]}
                </p>
              )}
            </div>

            <div className="flex items-center justify-between p-3 border border-border/50 rounded-xl bg-muted/10">
              <div className="flex flex-col gap-0.5">
                <label className="text-sm font-medium">
                  {labels.typeMulti}
                </label>
                <p className="text-xs text-muted-foreground">
                  {isMulti
                    ? labels.typeMultiDescription
                    : labels.typeSingleDescription}
                </p>
              </div>
              <Switch
                checked={isMulti}
                onCheckedChange={setIsMulti}
                disabled={loading || isPending}
                className="cursor-pointer"
                dir="ltr"
              />
            </div>

            <div className="flex flex-col gap-2">
              <label className="text-sm font-medium">
                {labels.closesAtLabel}
              </label>
              <div className="flex items-center flex-wrap gap-2">
                <DatePicker
                  value={closesDateKey}
                  onChange={handleDateChange}
                  locale={locale}
                  minDateKey={minDateKey}
                  placeholder={labels.closesAtDatePlaceholder}
                  disabled={loading || isPending}
                  className="w-44 grow-2"
                />
                <TimePicker
                  value={closesTime}
                  onChange={handleTimeChange}
                  locale={locale}
                  minTime={minTime}
                  placeholder={labels.timePlaceholder}
                  disabled={loading || isPending || !closesDateKey}
                  className="w-32 grow"
                />
              </div>
              {labels.closesAtHint && (
                <p className="text-xs text-muted-foreground">
                  {labels.closesAtHint}
                </p>
              )}
              {errors.closesAt && (
                <p className="text-xs font-bold text-destructive">
                  {errors.closesAt[0]}
                </p>
              )}
            </div>

            <div className="flex flex-col gap-3 mb-6">
              <label className="text-sm font-medium">
                {labels.optionsLabel}
              </label>

              <div className="flex items-center gap-2 mb-2">
                <div className="relative flex-1 min-w-0">
                  <Input
                    ref={draftInputRef}
                    value={draftValue}
                    onChange={e => setDraftValue(e.target.value)}
                    onFocus={() => setIsDraftFocused(true)}
                    onBlur={() => setIsDraftFocused(false)}
                    onKeyDown={handleDraftKeyDown}
                    placeholder={labels.optionDraftPlaceholder}
                    disabled={loading || isPending}
                    className={cn(isBadgeInsideInput && 'ps-28')}
                  />
                  {draftPlace && (
                    <div
                      onMouseDown={e => e.preventDefault()}
                      className={cn(
                        'absolute inset-s-2 flex items-center transition-all duration-150',
                        isBadgeInsideInput
                          ? 'top-1/2 -translate-y-1/2'
                          : '-bottom-6 translate-y-1',
                      )}
                    >
                      <PlaceBadge
                        place={draftPlace}
                        onRemove={() => setDraftPlace(null)}
                        removeLabel={labels.removePlaceLabel}
                        className="max-w-24"
                      />
                    </div>
                  )}
                </div>

                <PlacePickerPopover
                  places={savedPlaces}
                  labels={{
                    title: pickerLabels.title,
                    searchPlaceholder: pickerLabels.searchPlaceholder,
                    noPlaces: pickerLabels.noPlaces,
                    noResults: pickerLabels.noResults,
                  }}
                  onSelect={place => setDraftPlace(place)}
                  trigger={
                    <Button
                      type="button"
                      variant="outline"
                      size="icon"
                      disabled={loading || isPending}
                      className="shrink-0 text-muted-foreground hover:text-primary cursor-pointer border-dashed border-border/60 hover:border-primary/50"
                    >
                      <MapPin className="size-4" />
                    </Button>
                  }
                />

                <Button
                  type="button"
                  size="icon"
                  variant="outline"
                  disabled={loading || isPending || !canCommitDraft}
                  onClick={handleCommitDraft}
                  aria-label={labels.addOption}
                  className="shrink-0 cursor-pointer"
                >
                  <Plus className="size-4" />
                </Button>
              </div>

              {options.length > 0 && (
                <div className="flex flex-col gap-2 mt-4">
                  {options.map(opt => (
                    <div
                      key={opt.id}
                      className="flex items-center justify-between gap-2 p-2 rounded-lg border border-border/50 bg-muted/10"
                    >
                      <div className="flex flex-col gap-1.5 min-w-0 flex-1">
                        {opt.value && (
                          <span className="text-sm wrap-break-word">
                            {opt.value}
                          </span>
                        )}
                        {opt.place && (
                          <PlaceBadge
                            place={opt.place}
                            className="max-w-full self-start"
                          />
                        )}
                      </div>
                      <Button
                        type="button"
                        variant="ghost"
                        size="icon"
                        className="shrink-0 size-7 text-muted-foreground hover:text-destructive cursor-pointer"
                        disabled={loading || isPending}
                        onClick={() => handleRemoveOption(opt.id)}
                      >
                        <Trash2 className="size-3.5" />
                      </Button>
                    </div>
                  ))}
                </div>
              )}

              {errors.options && (
                <p className="text-xs font-bold text-destructive">
                  {errors.options[0]}
                </p>
              )}
            </div>
          </form>
        </ScrollArea>
        <DialogFooter className="px-4 pb-0 m-0 border-t border-border/50 bg-muted/10">
          <Button
            type="submit"
            form="create-poll-form"
            className="w-full cursor-pointer"
            disabled={
              loading ||
              isPending ||
              !question.trim() ||
              !closesAt ||
              options.length < 2
            }
          >
            {loading || isPending ? labels.createLoading : labels.createButton}
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}
