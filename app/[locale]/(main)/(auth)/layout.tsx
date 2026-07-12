import { ArrowLeft, ArrowRight } from 'lucide-react';

import { getLocale, getTranslations } from 'next-intl/server';
import Image from 'next/image';

import { Link } from '@/i18n/navigation';

import { RouteMapBackground } from '@/components/layout/RouteMapBackground';
import { Button } from '@/components/ui/button';

import AuthCard from './_components/AuthCard';

export default async function AuthLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  const locale = await getLocale();
  const t = await getTranslations('Auth.Layout');
  const isRtl = locale === 'fa';
  const ArrowIcon = isRtl ? ArrowRight : ArrowLeft;

  return (
    <div className="min-h-screen flex flex-col items-center justify-center p-4 relative overflow-hidden">
      <RouteMapBackground />
      <div className="relative z-10 w-full max-w-5xl flex flex-col gap-4 sm:gap-6">
        <div className="flex items-center justify-start">
          <Button
            variant="ghost"
            asChild
            className="text-muted-foreground hover:text-foreground hover:bg-transparent cursor-pointer gap-2"
          >
            <Link href="/">
              <ArrowIcon className="size-4" />
              {t('backToHome')}
            </Link>
          </Button>
        </div>

        <AuthCard mirrored={!isRtl}>
          <div className="grid lg:grid-cols-2 p-4">
            <div className="hidden lg:flex flex-col justify-center my-auto px-14 text-primary-foreground/90">
              <p className="w-36 text-lg font-medium leading-relaxed">
                {t('brandTagline')}
              </p>
            </div>

            <div className="flex lg:hidden flex-col items-center gap-2">
              <Link href="/" className="flex items-center gap-2.5">
                <Image
                  src="/icon.svg"
                  alt="Waypoint logo"
                  width={40}
                  height={40}
                  className="size-14 drop-shadow-sm"
                  loading="eager"
                />
                <span className="text-2xl text-primary-foreground font-bold tracking-tight">
                  Waypoint
                </span>
              </Link>
            </div>
            <div className="flex items-center justify-center px-0 mt-4 sm:mt-0 sm:p-4">
              <div className="w-full max-w-md">{children}</div>
            </div>
          </div>
        </AuthCard>
      </div>
    </div>
  );
}
