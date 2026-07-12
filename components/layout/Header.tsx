import { getLocale, getTranslations } from 'next-intl/server';
import Image from 'next/image';

import { Link } from '@/i18n/navigation';

import LanguageSwitcher from '@/components/layout/LanguageSwitcher';
import { Navigation } from '@/components/layout/Navigation';
import { ScrollHeader } from '@/components/layout/ScrollHeader';
import { ThemeToggle } from '@/components/layout/ThemeToggle';

export async function Header() {
  const locale = await getLocale();

  const tHeader = await getTranslations('Header');
  const tTheme = await getTranslations('ThemeToggle');
  const tLang = await getTranslations('LanguageSwitcher');
  const tNav = await getTranslations('Navigation');

  return (
    <ScrollHeader>
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

        <Navigation
          labels={{
            home: tNav('home'),
            trips: tNav('trips'),
            about: tNav('about'),
          }}
        />

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
    </ScrollHeader>
  );
}
