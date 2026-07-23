import { Metadata } from 'next';
import { getLocale, getTranslations } from 'next-intl/server';
import { Suspense } from 'react';

import RegisterForm from './_components/RegisterForm';
import RegisterSkeleton from './_components/RegisterSkeleton';

export async function generateMetadata({
  params,
}: {
  params: Promise<{ locale: string }>;
}): Promise<Metadata> {
  const { locale } = await params;
  const t = await getTranslations({ locale, namespace: 'Metadata' });
  return { title: t('Register') };
}

export default async function RegisterPage() {
  const locale = await getLocale();
  const t = await getTranslations('Auth.Register');
  const tOAuth = await getTranslations('Auth.OAuth');
  const tVal = await getTranslations('Auth.Validations');

  const labels = {
    title: t('title'),
    description: t('description'),
    email: t('email'),
    emailPlaceholder: t('emailPlaceholder'),
    password: t('password'),
    passwordPlaceholder: t('passwordPlaceholder'),
    confirmPassword: t('confirmPassword'),
    confirmPasswordPlaceholder: t('confirmPasswordPlaceholder'),
    submitButton: t('submitButton'),
    submitLoading: t('submitLoading'),
    orContinueWith: t('orContinueWith'),
    googleButton: t('googleButton'),
    googleLoading: t('googleLoading'),
    hasAccount: t('hasAccount'),
    loginLink: t('loginLink'),
    successToast: t('successToast'),
    conflictErrorTitle: tOAuth('conflictErrorTitle'),
    conflictErrorDesc: tOAuth('conflictErrorDesc'),
    oauthError: tOAuth('oauthError'),
  };

  const validationLabels = {
    invalidEmail: tVal('invalidEmail'),
    requiredPassword: tVal('requiredPassword'),
    requiredCaptcha: tVal('requiredCaptcha'),
    passwordMinLength: tVal('passwordMinLength'),
    passwordRegex: tVal('passwordRegex'),
    passwordsMismatch: tVal('passwordsMismatch'),
    invalidCaptchaServer: tVal('invalidCaptchaServer'),
    emailExists: tVal('emailExists'),
    invalidInputs: tVal('invalidInputs'),
    InvalidCredentials: tVal('InvalidCredentials'),
    AuthError: tVal('AuthError'),
    ServerError: tVal('ServerError'),
  };

  return (
    <Suspense fallback={<RegisterSkeleton />}>
      <RegisterForm
        locale={locale}
        labels={labels}
        valLabels={validationLabels}
      />
    </Suspense>
  );
}
