import { Metadata } from 'next';
import { getTranslations } from 'next-intl/server';
import { Suspense } from 'react';

import ResetPasswordForm from './_components/ResetPasswordForm';
import ResetPasswordSkeleton from './_components/ResetPasswordSkeleton';

export async function generateMetadata({
  params,
}: {
  params: Promise<{ locale: string }>;
}): Promise<Metadata> {
  const { locale } = await params;
  const t = await getTranslations({ locale, namespace: 'Metadata' });
  return {
    title: t('ResetPassword'),
    robots: { index: false, follow: false },
  };
}

export default async function ResetPasswordPage({
  searchParams,
}: {
  searchParams: Promise<{ token?: string }>;
}) {
  const { token } = await searchParams;
  const t = await getTranslations('Auth.ResetPassword');
  const tVal = await getTranslations('Auth.Validations');

  const labels = {
    title: t('title'),
    description: t('description'),
    password: t('password'),
    passwordPlaceholder: t('passwordPlaceholder'),
    confirmPassword: t('confirmPassword'),
    confirmPasswordPlaceholder: t('confirmPasswordPlaceholder'),
    submitButton: t('submitButton'),
    submitLoading: t('submitLoading'),
    backToLogin: t('backToLogin'),
    invalidToken: t('invalidToken'),
  };

  const validationLabels = {
    passwordMinLength: tVal('passwordMinLength'),
    passwordRegex: tVal('passwordRegex'),
    passwordsMismatch: tVal('passwordsMismatch'),
    invalidOrExpiredToken: tVal('invalidOrExpiredToken'),
  };

  return (
    <Suspense fallback={<ResetPasswordSkeleton />}>
      <ResetPasswordForm
        token={token}
        labels={labels}
        valLabels={validationLabels}
      />
    </Suspense>
  );
}
