import { Metadata } from 'next';
import { getTranslations } from 'next-intl/server';

import { redirect } from '@/i18n/navigation';

import { auth } from '@/auth';

import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Separator } from '@/components/ui/separator';

import prisma from '@/lib/prisma';

import AvatarSection from './_components/AvatarSection';
import DeleteAccountSection from './_components/DeleteAccountSection';
import EmailSection from './_components/EmailSection';
import GoogleLinkResultNotice from './_components/GoogleLinkResultNotice';
import GoogleSection from './_components/GoogleSection';
import PasswordSection from './_components/PasswordSection';
import ProfileInfoForm from './_components/ProfileInfoForm';

export async function generateMetadata({
  params,
}: {
  params: Promise<{ locale: string }>;
}): Promise<Metadata> {
  const { locale } = await params;
  const t = await getTranslations({ locale, namespace: 'Profile' });
  return { title: t('title'), robots: { index: false, follow: false } };
}

export default async function ProfilePage({
  params,
  searchParams,
}: {
  params: Promise<{ locale: string }>;
  searchParams: Promise<{ googleLink?: string }>;
}) {
  const { locale } = await params;
  const { googleLink } = await searchParams;
  const session = await auth();

  if (!session?.user?.id) {
    redirect({ href: '/login', locale });
    return null;
  }

  const user = await prisma.user.findUnique({
    where: { id: session.user.id },
    include: { accounts: { select: { provider: true } } },
  });

  if (!user) {
    redirect({ href: '/login', locale });
    return null;
  }

  const t = await getTranslations('Profile');
  const tUpload = await getTranslations('ImageUpload');

  const labels = {
    title: t('title'),
    description: t('description'),
    infoTitle: t('infoTitle'),
    nameLabel: t('nameLabel'),
    namePlaceholder: t('namePlaceholder'),
    localeLabel: t('localeLabel'),
    save: t('save'),
    saving: t('saving'),
    infoSuccess: t('infoSuccess'),
    avatarTitle: t('avatarTitle'),
    avatarSuccess: t('avatarSuccess'),
    avatarRemoved: t('avatarRemoved'),
    googleTitle: t('googleTitle'),
    googleConnected: t('googleConnected'),
    googleNotConnected: t('googleNotConnected'),
    emailVerified: t('emailVerified'),
    emailNotVerified: t('emailNotVerified'),
    resendVerification: t('resendVerification'),
    changeEmail: t('changeEmail'),
    newEmailLabel: t('newEmailLabel'),
    sendConfirmation: t('sendConfirmation'),
    resendSuccess: t('resendSuccess'),
    changeRequestSuccess: t('changeRequestSuccess'),
    accountSecurityTitle: t('accountSecurityTitle'),
    noPasswordSet: t('noPasswordSet'),
    lastPasswordChangeLabel: t('lastPasswordChangeLabel'),
    setPassword: t('setPassword'),
    changePassword: t('changePassword'),
    currentPassword: t('currentPassword'),
    newPassword: t('newPassword'),
    confirmPassword: t('confirmPassword'),
    passwordSuccess: t('passwordSuccess'),
    connectGoogle: t('connectGoogle'),
    googleUnlinkWarning: t('googleUnlinkWarning'),
    googleLinkSuccess: t('googleLinkSuccess'),
    googleLinkAlready: t('googleLinkAlready'),
    googleLinkTaken: t('googleLinkTaken'),
    googleLinkEmailMismatch: t('googleLinkEmailMismatch'),
    deleteTitle: t('deleteTitle'),
    deleteDesc: t('deleteDesc'),
    deleteButton: t('deleteButton'),
    deleteDialogTitle: t('deleteDialogTitle'),
    deleteDialogDesc: t('deleteDialogDesc'),
    deleteConfirmWord: t('deleteConfirmWord'),
    deleteInputPlaceholder: t('deleteInputPlaceholder'),
    deleting: t('deleting'),
    deleteError: t('deleteError'),
    cancel: tUpload('cancel'),
  };

  const uploadLabels = {
    dragHint: tUpload('dragHint'),
    clickHint: tUpload('clickHint'),
    sizeHint: tUpload('sizeHint'),
    remove: tUpload('remove'),
    edit: tUpload('edit'),
    cropTitle: tUpload('cropTitle'),
    preparing: tUpload('preparing'),
    confirm: tUpload('confirm'),
    cancel: tUpload('cancel'),
    errorSize: tUpload('errorSize'),
    errorType: tUpload('errorType'),
    presetOriginal: tUpload('presetOriginal'),
    avatarUpload: tUpload('avatarUpload'),
    removeConfirmTitle: tUpload('removeConfirmTitle'),
  };

  const isGoogleConnected = user.accounts.some(a => a.provider === 'google');
  const lastPasswordChangeAt = user.password
    ? (user.passwordChangedAt ?? user.createdAt)
    : null;
  const hasCloudinaryImage = !!user.imagePublicId;

  const googleConnectHint = t.rich('googleConnectHint', {
    email: user.email,
    styled: chunks => (
      <span className="font-semibold text-primary">{chunks}</span>
    ),
  });

  const googleConnectedHint = t.rich('googleConnectedHint', {
    email: user.email,
    styled: chunks => (
      <span className="font-semibold text-primary">{chunks}</span>
    ),
  });

  const googleLinkMessage =
    googleLink === 'success'
      ? { text: labels.googleLinkSuccess, variant: 'success' as const }
      : googleLink === 'already'
        ? { text: labels.googleLinkAlready, variant: 'success' as const }
        : googleLink === 'taken'
          ? { text: labels.googleLinkTaken, variant: 'error' as const }
          : googleLink === 'emailMismatch'
            ? {
                text: labels.googleLinkEmailMismatch,
                variant: 'error' as const,
              }
            : null;

  return (
    <>
      {googleLinkMessage && <GoogleLinkResultNotice {...googleLinkMessage} />}
      <div className="container mx-auto px-4 py-8 md:py-12 max-w-4xl">
        <div className="mb-8">
          <h1 className="text-3xl font-bold tracking-tight">{labels.title}</h1>
          <p className="text-muted-foreground mt-1">{labels.description}</p>
        </div>

        <div className="grid gap-6">
          <Card className="shadow-sm border-border/50">
            <CardHeader>
              <CardTitle>{labels.infoTitle}</CardTitle>
            </CardHeader>
            <CardContent className="flex flex-col md:flex-row gap-8">
              <div className="w-full md:w-1/3 flex items-center justify-center">
                <label className="sr-only">{labels.avatarTitle}</label>
                <AvatarSection
                  initialImage={user.image}
                  hasCloudinaryImage={hasCloudinaryImage}
                  labels={labels}
                  uploadLabels={uploadLabels}
                  locale={locale}
                />
              </div>
              <div className="w-full md:w-2/3">
                <ProfileInfoForm
                  initialName={user.name || ''}
                  initialLocale={user.locale}
                  labels={labels}
                />
              </div>
            </CardContent>
          </Card>

          <Card className="shadow-sm border-border/50">
            <CardHeader>
              <CardTitle>{labels.accountSecurityTitle}</CardTitle>
            </CardHeader>
            <CardContent>
              <EmailSection
                currentEmail={user.email}
                isVerified={!!user.emailVerified}
                hasPassword={!!user.password}
                isGoogleConnected={isGoogleConnected}
                locale={locale}
                labels={labels}
              />
              <Separator className="my-6" />
              <PasswordSection
                hasPassword={!!user.password}
                lastPasswordChangeAt={lastPasswordChangeAt}
                labels={labels}
              />
              <Separator className="my-6" />
              <GoogleSection
                isGoogleConnected={isGoogleConnected}
                labels={labels}
                connectHint={googleConnectHint}
                connectedHint={googleConnectedHint}
              />
            </CardContent>
          </Card>

          <Card className="shadow-sm border-destructive/20 bg-destructive/5">
            <CardHeader>
              <CardTitle className="text-destructive">
                {labels.deleteTitle}
              </CardTitle>
            </CardHeader>
            <CardContent>
              <DeleteAccountSection labels={labels} />
            </CardContent>
          </Card>
        </div>
      </div>
    </>
  );
}
