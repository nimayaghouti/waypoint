'use client';

import { useState, useTransition } from 'react';
import { toast } from 'sonner';

import { useRouter } from '@/i18n/navigation';

import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';

import { updateUserLocaleAction } from '@/lib/actions/auth';
import { updateProfileAction } from '@/lib/actions/profile';

interface Props {
  initialName: string;
  initialLocale: string;
  labels: Record<string, string>;
}

export default function ProfileInfoForm({
  initialName,
  initialLocale,
  labels,
}: Props) {
  const [name, setName] = useState(initialName);
  const [locale, setLocale] = useState(initialLocale);
  const [isPending, startTransition] = useTransition();
  const router = useRouter();

  const handleSave = () => {
    startTransition(async () => {
      const result = await updateProfileAction({ name, locale });
      if (result?.error) toast.error(result.error);
      else {
        toast.success(labels.infoSuccess);
        if (locale !== initialLocale) {
          await updateUserLocaleAction(locale);
          router.replace('/profile', { locale });
        }
      }
    });
  };

  return (
    <div className="flex flex-col gap-4">
      <div className="flex flex-col gap-2">
        <label className="text-sm font-medium">{labels.nameLabel}</label>
        <Input
          value={name}
          onChange={e => setName(e.target.value)}
          disabled={isPending}
          placeholder={labels.namePlaceholder}
        />
      </div>
      <div className="flex flex-col gap-2">
        <label className="text-sm font-medium">{labels.localeLabel}</label>
        <Select value={locale} onValueChange={setLocale} disabled={isPending}>
          <SelectTrigger className="cursor-pointer">
            <SelectValue />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="en" className="cursor-pointer">
              English
            </SelectItem>
            <SelectItem value="fa" className="cursor-pointer">
              فارسی
            </SelectItem>
          </SelectContent>
        </Select>
      </div>
      <Button
        onClick={handleSave}
        disabled={
          isPending || (name === initialName && locale === initialLocale)
        }
        className="w-fit mt-2 cursor-pointer"
      >
        {isPending ? labels.saving : labels.save}
      </Button>
    </div>
  );
}
