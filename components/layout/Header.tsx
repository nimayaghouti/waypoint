import { getLocale, getTranslations } from 'next-intl/server';
import Image from 'next/image';
import Link from 'next/link';

import LanguageSwitcher from '@/components/layout/LanguageSwitcher';
import { ThemeToggle } from '@/components/layout/ThemeToggle';

export async function Header() {
  const locale = await getLocale();

  const tHeader = await getTranslations('Header');
  const tTheme = await getTranslations('ThemeToggle');
  const tLang = await getTranslations('LanguageSwitcher');

  return (
    <header className="sticky top-0 z-50 w-full border-b border-border/40 bg-background/95 backdrop-blur supports-backdrop-filter:bg-background/60">
      <div className="container mx-auto flex h-16 items-center justify-between px-4 md:px-8">
        <Link
          href="/"
          className="flex items-center gap-2 transition-opacity hover:opacity-80"
        >
          <Image
            src="/icon.svg"
            alt={tHeader('logoAlt')}
            width={32}
            height={32}
          />
          <span className="font-bold text-xl text-primary hidden sm:inline-block">
            Waypoint
          </span>
        </Link>

        <div className="flex items-center gap-2">
          <LanguageSwitcher
            locale={locale}
            labels={{
              trigger: tLang('trigger'),
              en: tLang('en'),
              fa: tLang('fa'),
            }}
          />
          <ThemeToggle
            labels={{
              toggle: tTheme('toggle'),
              light: tTheme('light'),
              dark: tTheme('dark'),
              system: tTheme('system'),
            }}
          />
        </div>
      </div>
    </header>
  );
}
