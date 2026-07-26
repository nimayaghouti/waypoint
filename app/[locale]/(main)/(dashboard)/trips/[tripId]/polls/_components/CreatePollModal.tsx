'use client';

import { Plus, Trash2 } from 'lucide-react';

import { useState, useTransition } from 'react';
import { toast } from 'sonner';
import { z } from 'zod';

import { Button } from '@/components/ui/button';
import { DatePicker } from '@/components/ui/date-picker';
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from '@/components/ui/dialog';
import { Input } from '@/components/ui/input';
import { ScrollArea } from '@/components/ui/scroll-area';
import { Switch } from '@/components/ui/switch';
import { TimePicker } from '@/components/ui/time-picker';

import { createPollAction } from '@/lib/actions/poll';
import { getPollSchemas } from '@/lib/validations/poll';

interface Props {
  tripId: string;
  locale: string;
  labels: Record<string, string>;
  valLabels: Record<string, string>;
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
  labels,
  valLabels,
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
  const [options, setOptions] = useState([
    { id: 1, value: '' },
    { id: 2, value: '' },
  ]);

  const { CreatePollSchema } = getPollSchemas(valLabels);

  const closesDateKey = closesAt ? closesAt.slice(0, 10) : '';
  const closesTime = closesAt ? closesAt.slice(11, 16) : '';
  const minClosesAt = getMinClosesAt();
  const minDateKey = minClosesAt.slice(0, 10);
  const minTime =
    closesDateKey === minDateKey ? minClosesAt.slice(11, 16) : undefined;
  const filledOptions = options
    .map(o => ({ ...o, value: o.value.trim() }))
    .filter(o => o.value.length > 0);

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

  const handleAddOption = () => {
    setOptions([...options, { id: Date.now(), value: '' }]);
  };

  const handleRemoveOption = (id: number) => {
    if (options.length <= 2) return;
    setOptions(options.filter(opt => opt.id !== id));
  };

  const handleOptionChange = (id: number, value: string) => {
    setOptions(options.map(opt => (opt.id === id ? { ...opt, value } : opt)));
  };

  const resetForm = () => {
    setQuestion('');
    setIsMulti(false);
    setClosesAt('');
    setOptions([
      { id: 1, value: '' },
      { id: 2, value: '' },
    ]);
  };

  const handleSubmit = async (e: React.SubmitEvent) => {
    e.preventDefault();
    setErrors({});
    setLoading(true);

    const closesAtUtcIso = closesAt ? new Date(closesAt).toISOString() : '';
    const data = {
      question,
      type: isMulti ? 'MULTI' : 'SINGLE',
      options: filledOptions.map(o => ({ value: o.value })),
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
      <DialogContent className="sm:max-w-125 max-h-[90vh] overflow-y-auto px-0">
        <ScrollArea className="h-[80vh] px-2">
          <DialogHeader className="px-2">
            <DialogTitle>{labels.createTitle}</DialogTitle>
            <DialogDescription>{labels.createDesc}</DialogDescription>
          </DialogHeader>

          <form
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
                  placeholder="--:--"
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

            <div className="flex flex-col gap-3">
              <label className="text-sm font-medium">
                {labels.optionsLabel}
              </label>
              {options.map((opt, index) => (
                <div key={opt.id} className="flex items-center gap-2">
                  <Input
                    value={opt.value}
                    onChange={e => handleOptionChange(opt.id, e.target.value)}
                    placeholder={`${labels.optionsLabel} ${index + 1}`}
                    disabled={loading || isPending}
                  />
                  <Button
                    type="button"
                    variant="ghost"
                    size="icon"
                    className="shrink-0 text-muted-foreground hover:text-destructive cursor-pointer"
                    disabled={options.length <= 2 || loading || isPending}
                    onClick={() => handleRemoveOption(opt.id)}
                  >
                    <Trash2 className="size-4" />
                  </Button>
                </div>
              ))}
              {errors.options && (
                <p className="text-xs font-bold text-destructive">
                  {errors.options[0]}
                </p>
              )}

              <Button
                type="button"
                variant="outline"
                size="sm"
                className="w-full mt-2 border-dashed cursor-pointer"
                onClick={handleAddOption}
                disabled={loading || isPending}
              >
                <Plus className="size-4 rtl:ml-2 ltr:mr-2" /> {labels.addOption}
              </Button>
            </div>

            <Button
              type="submit"
              className="cursor-pointer"
              disabled={
                loading ||
                isPending ||
                !question.trim() ||
                !closesAt ||
                filledOptions.length < 2
              }
            >
              {loading || isPending
                ? labels.createLoading
                : labels.createButton}
            </Button>
          </form>
        </ScrollArea>
      </DialogContent>
    </Dialog>
  );
}
