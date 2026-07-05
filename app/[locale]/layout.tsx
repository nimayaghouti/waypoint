import { NextIntlClientProvider } from 'next-intl';
import { getMessages } from 'next-intl/server';
import localFont from 'next/font/local';

import '../globals.css';

const plusJakartaSans = localFont({
  src: '../fonts/PlusJakartaSans/PlusJakartaSans[wght].woff2',
  variable: '--font-plus-jakarta-sans',
  adjustFontFallback: false,
});

const vazirmatn = localFont({
  src: '../fonts/vazirmatn/Vazirmatn[wght].woff2',
  variable: '--font-vazirmatn',
  adjustFontFallback: false,
});

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
