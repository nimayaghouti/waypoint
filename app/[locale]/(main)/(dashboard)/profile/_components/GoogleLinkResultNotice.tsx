'use client';

import { useEffect } from 'react';
import { toast } from 'sonner';

import { usePathname, useRouter } from '@/i18n/navigation';

type Props = {
  text: string;
  variant: 'success' | 'error';
};

export default function GoogleLinkResultNotice({ text, variant }: Props) {
  const router = useRouter();
  const pathname = usePathname();

  useEffect(() => {
    if (variant === 'success') toast.success(text);
    else toast.error(text);

    router.replace(pathname, { scroll: false });
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  return null;
}
