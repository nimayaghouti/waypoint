import { XCircle } from 'lucide-react';

import { getLocale, getTranslations } from 'next-intl/server';

import { Link, redirect } from '@/i18n/navigation';

import { Button } from '@/components/ui/button';
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from '@/components/ui/card';

import { joinTripByInviteCodeAction } from '@/lib/actions/trip';

export default async function InviteMagicLinkPage({
  params,
}: {
  params: Promise<{ locale: string; inviteCode: string }>;
}) {
  const { inviteCode } = await params;
  const locale = await getLocale();
  const t = await getTranslations('HomePage');

  const result = await joinTripByInviteCodeAction(inviteCode.toUpperCase());

  if (result?.success && result.tripId) {
    redirect({ href: `/trips/${result.tripId}`, locale });
  }

  return (
    <div className="container mx-auto px-4 py-16 flex items-center justify-center min-h-[60vh]">
      <Card className="border-border/50 shadow-lg w-full max-w-md bg-card/80 backdrop-blur-sm text-center">
        <CardHeader className="space-y-4">
          <div className="flex justify-center pt-4">
            <div className="rounded-full bg-destructive/10 p-4 text-destructive">
              <XCircle className="size-10" />
            </div>
          </div>
          <CardTitle className="text-2xl font-bold">
            {t('tripNotFound')}
          </CardTitle>
          <CardDescription className="text-base">
            {t('invalidCode')}
          </CardDescription>
        </CardHeader>
        <CardContent className="pb-8">
          <Button asChild className="w-full">
            <Link href="/">{t('ctaStart')}</Link>
          </Button>
        </CardContent>
      </Card>
    </div>
  );
}
