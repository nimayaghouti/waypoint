import { Metadata } from 'next';
import { NextIntlClientProvider } from 'next-intl';
import { getMessages, getTranslations } from 'next-intl/server';
import localFont from 'next/font/local';

import '../globals.css';

const plusJakartaSans = localFont({
  src: '../fonts/PlusJakartaSans/PlusJakartaSans[wght].woff2',
  variable: '--font-plus-jakarta-sans',
  adjustFontFallback: false,
  preload: false,
});

const vazirmatn = localFont({
  src: '../fonts/vazirmatn/Vazirmatn[wght].woff2',
  variable: '--font-vazirmatn',
  adjustFontFallback: false,
  preload: false,
});

export async function generateMetadata({
  params,
}: {
  params: Promise<{ locale: string }>;
}): Promise<Metadata> {
  const { locale } = await params;
  const t = await getTranslations({ locale, namespace: 'Metadata' });

  return {
    title: {
      template: t('title.template'),
      default: t('title.default'),
    },
    description: t('description'),
  };
}

export default async function LocaleLayout({
  children,
  params,
}: {
  children: React.ReactNode;
  params: Promise<{ locale: string }>;
}) {
  const { locale } = await params;
  const messages = await getMessages();
  const dir = locale === 'fa' ? 'rtl' : 'ltr';

  return (
    <html lang={locale} dir={dir}>
      <body
        className={`${plusJakartaSans.variable} ${vazirmatn.variable} font-sans min-h-screen bg-background antialiased flex flex-col`}
      >
        <NextIntlClientProvider messages={messages}>
          {children}
        </NextIntlClientProvider>
      </body>
    </html>
  );
}
