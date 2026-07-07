import { getTranslations } from 'next-intl/server';

import LanguageSwitcher from '@/components/layout/LanguageSwitcher';

export async function generateMetadata({
  params,
}: {
  params: Promise<{ locale: string }>;
}) {
  const { locale } = await params;
  const t = await getTranslations({ locale, namespace: 'HomePage' });

  return {
    title: t('metaTitle'),
    description: t('metaDescription'),
  };
}

export default async function HomePage({
  params,
}: {
  params: Promise<{ locale: string }>;
}) {
  const { locale } = await params;
  const t = await getTranslations({ locale, namespace: 'HomePage' });

  return (
    <main className="flex min-h-screen flex-col items-center justify-center p-24 gap-8">
      <div className="text-center space-y-4">
        <h1 className="text-4xl font-bold">{t('title')}</h1>
        <p className="text-lg text-gray-600">{t('description')}</p>
      </div>

      <LanguageSwitcher />
    </main>
  );
}
