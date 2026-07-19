import { getLocale, getTranslations } from 'next-intl/server';
import { Suspense } from 'react';

import ForgotPasswordForm from './_components/ForgotPasswordForm';
import ForgotPasswordSkeleton from './_components/ForgotPasswordSkeleton';

export default async function ForgotPasswordPage() {
  const locale = await getLocale();
  const t = await getTranslations('Auth.ForgotPassword');
  const tVal = await getTranslations('Auth.Validations');

  const labels = {
    title: t('title'),
    description: t('description'),
    email: t('email'),
    emailPlaceholder: t('emailPlaceholder'),
    submitButton: t('submitButton'),
    submitLoading: t('submitLoading'),
    backToLogin: t('backToLogin'),
    successMessage: t('successMessage'),
  };

  const validationLabels = {
    invalidEmail: tVal('invalidEmail'),
    requiredCaptcha: tVal('requiredCaptcha'),
    invalidCaptchaServer: tVal('invalidCaptchaServer'),
  };

  return (
    <Suspense fallback={<ForgotPasswordSkeleton />}>
      <ForgotPasswordForm
        locale={locale}
        labels={labels}
        valLabels={validationLabels}
      />
    </Suspense>
  );
}
