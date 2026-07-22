import { getLocale } from 'next-intl/server';

import { redirect } from '@/i18n/navigation';

import { auth } from '@/auth';

export default async function DashboardLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  const session = await auth();

  if (!session?.user) {
    const locale = await getLocale();
    redirect({ href: '/login', locale });
  }

  return <div className="flex-1 flex flex-col w-full">{children}</div>;
}
