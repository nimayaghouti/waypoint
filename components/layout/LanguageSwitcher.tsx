'use client';

import { Globe } from 'lucide-react';

import { useTransition } from 'react';

import { usePathname, useRouter } from '@/i18n/navigation';

import { Button } from '@/components/ui/button';
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
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

  function onLanguageChange(nextLocale: string) {
    if (nextLocale === locale) return;
    startTransition(() => {
      router.replace(pathname, { locale: nextLocale });
    });
  }

  return (
    <DropdownMenu>
      <DropdownMenuTrigger asChild>
        <Button
          variant="ghost"
          size="icon"
          className="hover:text-primary rounded-full cursor-pointer"
          disabled={isPending}
        >
          <Globe className="h-[1.2rem] w-[1.2rem]" />
          <span className="sr-only">{labels.trigger}</span>
        </Button>
      </DropdownMenuTrigger>
      <DropdownMenuContent align="end">
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
      </DropdownMenuContent>
    </DropdownMenu>
  );
}
