import { Map, Users, Wallet } from 'lucide-react';

import { getTranslations } from 'next-intl/server';

import { RouteMapBackground } from '@/components/layout/RouteMapBackground';

import HeroActions from './_components/HeroActions';

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

export default async function HomePage() {
  const t = await getTranslations('HomePage');

  const actionLabels = {
    ctaStart: t('ctaStart'),
    ctaJoin: t('ctaJoin'),
    joinModalTitle: t('joinModalTitle'),
    joinModalDesc: t('joinModalDesc'),
    inviteCodePlaceholder: t('inviteCodePlaceholder'),
    joinSubmit: t('joinSubmit'),
    joinLoading: t('joinLoading'),
    invalidCode: t('invalidCode'),
    tripNotFound: t('tripNotFound'),
  };

  return (
    <div className="flex flex-col relative overflow-hidden">
      <RouteMapBackground />

      <section className="min-h-screen relative z-10 w-full flex flex-col items-center justify-center text-center pb-8 px-4">
        <div
          className="inline-flex items-center rounded-full border border-primary/20 bg-primary/5 px-3 py-1 text-sm font-medium text-primary mb-8 backdrop-blur-sm"
          dir="ltr"
        >
          🌟 Waypoint Beta is Live!
        </div>

        <h1 className="max-w-4xl text-4xl font-extrabold tracking-tight sm:text-5xl lg:text-6xl leading-normal bg-clip-text text-transparent bg-linear-to-br from-foreground to-foreground/70">
          {t('heroTitle')}
        </h1>

        <p className="mt-6 max-w-2xl text-lg md:text-xl text-muted-foreground leading-relaxed">
          {t('heroSubtitle')}
        </p>

        <HeroActions labels={actionLabels} />
      </section>

      <section className="min-h-screen relative z-10 w-full flex justify-center items-center py-20 bg-muted/30 backdrop-blur-md border-y border-border/50">
        <div className="container mx-auto px-4 md:px-8">
          <div className="text-center mb-16">
            <h2 className="text-3xl font-bold tracking-tight sm:text-4xl">
              {t('featuresTitle')}
            </h2>
          </div>

          <div className="grid gap-8 md:grid-cols-3">
            <div className="flex flex-col items-center text-center p-6 bg-card rounded-2xl shadow-sm border border-border/50 hover:shadow-md transition-shadow">
              <div className="p-4 bg-primary/10 rounded-full text-primary mb-4">
                <Users className="size-8" />
              </div>
              <h3 className="text-xl font-bold mb-2">{t('featCollabTitle')}</h3>
              <p className="text-muted-foreground leading-relaxed">
                {t('featCollabDesc')}
              </p>
            </div>

            <div className="flex flex-col items-center text-center p-6 bg-card rounded-2xl shadow-sm border border-border/50 hover:shadow-md transition-shadow">
              <div className="p-4 bg-accent/10 rounded-full text-accent mb-4">
                <Wallet className="size-8" />
              </div>
              <h3 className="text-xl font-bold mb-2">
                {t('featExpenseTitle')}
              </h3>
              <p className="text-muted-foreground leading-relaxed">
                {t('featExpenseDesc')}
              </p>
            </div>

            <div className="flex flex-col items-center text-center p-6 bg-card rounded-2xl shadow-sm border border-border/50 hover:shadow-md transition-shadow">
              <div className="p-4 bg-secondary-foreground/10 rounded-full text-secondary-foreground mb-4">
                <Map className="size-8" />
              </div>
              <h3 className="text-xl font-bold mb-2">{t('featMapTitle')}</h3>
              <p className="text-muted-foreground leading-relaxed">
                {t('featMapDesc')}
              </p>
            </div>
          </div>
        </div>
      </section>
    </div>
  );
}
