import { getTranslations } from 'next-intl/server';

export async function Footer() {
  const t = await getTranslations('Footer');

  return (
    <footer className="w-full border-t border-border/40 py-6 md:py-0">
      <div className="container mx-auto flex h-14 items-center justify-center text-sm text-muted-foreground">
        <p>{t('copyright')}</p>
      </div>
    </footer>
  );
}
