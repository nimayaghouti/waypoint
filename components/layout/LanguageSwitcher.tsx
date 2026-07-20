'use client';

import { Globe } from 'lucide-react';

import { useSearchParams } from 'next/navigation';
import { useTransition } from 'react';

import { usePathname, useRouter } from '@/i18n/navigation';

import {
  DropdownMenuItem,
  DropdownMenuPortal,
  DropdownMenuSub,
  DropdownMenuSubContent,
  DropdownMenuSubTrigger,
} from '@/components/ui/dropdown-menu';

import { cn } from '@/lib/utils';

interface LanguageSwitcherProps {
  locale: string;
  labels: {
    trigger: string;
    en: string;
    fa: string;
  };
}

export default function LanguageSwitcher({
  locale,
  labels,
}: LanguageSwitcherProps) {
  const [isPending, startTransition] = useTransition();
  const router = useRouter();
  const pathname = usePathname();

  const searchParams = useSearchParams();

  function onLanguageChange(nextLocale: string) {
    if (nextLocale === locale) return;

    const currentQuery = searchParams.toString();
    const querySuffix = currentQuery ? `?${currentQuery}` : '';

    startTransition(() => {
      router.replace(`${pathname}${querySuffix}`, { locale: nextLocale });
    });
  }

  return (
    <DropdownMenuSub>
      <DropdownMenuSubTrigger
        className="cursor-pointer gap-2"
        disabled={isPending}
      >
        <Globe className="size-4" />
        <span>{labels.trigger}</span>
      </DropdownMenuSubTrigger>
      <DropdownMenuPortal>
        <DropdownMenuSubContent>
          <DropdownMenuItem
            onClick={() => onLanguageChange('en')}
            className={cn(
              'cursor-pointer',
              locale === 'en' ? 'bg-muted font-bold' : '',
            )}
          >
            {labels.en}
          </DropdownMenuItem>
          <DropdownMenuItem
            onClick={() => onLanguageChange('fa')}
            className={cn(
              'cursor-pointer',
              locale === 'fa' ? 'bg-muted font-bold' : '',
            )}
          >
            {labels.fa}
          </DropdownMenuItem>
        </DropdownMenuSubContent>
      </DropdownMenuPortal>
    </DropdownMenuSub>
  );
}
