'use client';

import { useLocale, useTranslations } from 'next-intl';
import { startTransition } from 'react';

import { usePathname, useRouter } from '@/i18n/navigation';

export default function LanguageSwitcher() {
  const t = useTranslations('LocaleSwitcher');
  const locale = useLocale();
  const router = useRouter();
  const pathname = usePathname();

  function onSelectChange(e: React.ChangeEvent<HTMLSelectElement>) {
    const nextLocale = e.target.value;
    startTransition(() => {
      router.replace(pathname, { locale: nextLocale });
    });
  }

  return (
    <div className="flex items-center gap-2">
      <label htmlFor="language-select" className="sr-only">
        {t(locale as 'en' | 'fa')}
      </label>
      <select
        id="language-select"
        value={locale}
        onChange={onSelectChange}
        className="bg-transparent border border-gray-400 rounded p-1 text-sm outline-none"
      >
        <option value="en">{t('en')}</option>
        <option value="fa">{t('fa')}</option>
      </select>
    </div>
  );
}
