import { MailCheck, XCircle } from 'lucide-react';

import { Metadata } from 'next';
import { getTranslations } from 'next-intl/server';

import { Link } from '@/i18n/navigation';

import { Button } from '@/components/ui/button';
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from '@/components/ui/card';

import { verifyEmailTokenAction } from '@/lib/actions/auth';

export async function generateMetadata({
  params,
}: {
  params: Promise<{ locale: string }>;
}): Promise<Metadata> {
  const { locale } = await params;
  const t = await getTranslations({ locale, namespace: 'Metadata' });
  return {
    title: t('VerifyEmail'),
    robots: { index: false, follow: false },
  };
}

export default async function VerifyEmailPage({
  searchParams,
}: {
  searchParams: Promise<{ token?: string }>;
}) {
  const { token } = await searchParams;
  const t = await getTranslations('Auth.VerifyEmail');

  let result: { success?: string; error?: string } = {
    error: t('invalidToken'),
  };

  if (token) {
    result = await verifyEmailTokenAction(token);
  }

  return (
    <Card className="border-border/50 shadow-lg w-full bg-card/80 backdrop-blur-sm">
      <CardHeader className="text-center space-y-4">
        <div className="flex justify-center pt-4">
          {result.success ? (
            <div className="rounded-full bg-green-100 p-4 text-green-600 dark:bg-green-900/30 dark:text-green-400">
              <MailCheck className="size-10" />
            </div>
          ) : (
            <div className="rounded-full bg-destructive/10 p-4 text-destructive">
              <XCircle className="size-10" />
            </div>
          )}
        </div>
        <CardTitle className="text-2xl font-bold">{t('title')}</CardTitle>
        <CardDescription className="text-base">
          {result.success ? result.success : result.error}
        </CardDescription>
      </CardHeader>
      <CardContent className="flex justify-center mt-2 pb-8">
        <Button asChild className="w-full sm:w-auto min-w-50">
          {result.success ? (
            <Link href="/trips">{t('continueToApp')}</Link>
          ) : (
            <Link href="/login">{t('backToLogin')}</Link>
          )}
        </Button>
      </CardContent>
    </Card>
  );
}
