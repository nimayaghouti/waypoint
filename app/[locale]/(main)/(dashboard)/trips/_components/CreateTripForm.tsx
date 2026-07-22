'use client';

import { useState, useTransition } from 'react';
import { toast } from 'sonner';
import { z } from 'zod';

import { useRouter } from '@/i18n/navigation';

import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';

import { createTripAction } from '@/lib/actions/trip';
import { getTripSchemas } from '@/lib/validations/trip';

interface Props {
  labels: Record<string, string>;
  valLabels: Record<string, string>;
  onSuccess: () => void;
}

export default function CreateTripForm({
  labels,
  valLabels,
  onSuccess,
}: Props) {
  const [loading, setLoading] = useState(false);
  const [errors, setErrors] = useState<Record<string, string[] | undefined>>(
    {},
  );
  const [isPending, startTransition] = useTransition();
  const router = useRouter();

  const { CreateTripSchema } = getTripSchemas(valLabels);

  const handleSubmit = async (e: React.SyntheticEvent<HTMLFormElement>) => {
    e.preventDefault();
    setErrors({});
    setLoading(true);

    const formData = new FormData(e.currentTarget);
    const data = {
      name: formData.get('name') as string,
      description: formData.get('description') as string,
    };

    const clientValidation = CreateTripSchema.safeParse(data);
    if (!clientValidation.success) {
      setErrors(z.flattenError(clientValidation.error).fieldErrors);
      setLoading(false);
      return;
    }

    startTransition(async () => {
      const result = await createTripAction(formData);

      if (result?.fieldErrors) {
        setErrors(result.fieldErrors);
        setLoading(false);
      } else if (result?.error) {
        toast.error('An error occurred.');
        setLoading(false);
      } else if (result?.success && result.tripId) {
        toast.success(labels.successToast);

        setLoading(false);
        (e.target as HTMLFormElement).reset();

        router.push(`/trips/${result.tripId}`);
      }
    });
  };

  return (
    <form onSubmit={handleSubmit} className="flex flex-col gap-6" noValidate>
      <div className="flex flex-col gap-2">
        <label htmlFor="name" className="text-sm font-medium">
          {labels.nameLabel}
        </label>
        <Input
          id="name"
          name="name"
          type="text"
          placeholder={labels.namePlaceholder}
          disabled={loading || isPending}
        />
        {errors.name && (
          <p className="text-xs font-bold text-destructive">{errors.name[0]}</p>
        )}
      </div>

      <div className="flex flex-col gap-2">
        <label htmlFor="description" className="text-sm font-medium">
          {labels.descLabel}
        </label>
        <textarea
          id="description"
          name="description"
          rows={4}
          className="flex min-h-20 w-full rounded-md border border-input bg-background px-3 py-2 text-sm ring-offset-background placeholder:text-muted-foreground focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 disabled:cursor-not-allowed disabled:opacity-50"
          placeholder={labels.descPlaceholder}
          disabled={loading || isPending}
        />
        {errors.description && (
          <p className="text-xs font-bold text-destructive">
            {errors.description[0]}
          </p>
        )}
      </div>

      <div className="flex justify-end gap-3 mt-4">
        <Button
          type="button"
          variant="outline"
          className="cursor-pointer"
          onClick={onSuccess}
          disabled={loading || isPending}
        >
          {labels.backButton}
        </Button>
        <Button
          type="submit"
          className="cursor-pointer"
          disabled={loading || isPending}
        >
          {loading || isPending ? labels.submitLoading : labels.submitButton}
        </Button>
      </div>
    </form>
  );
}
