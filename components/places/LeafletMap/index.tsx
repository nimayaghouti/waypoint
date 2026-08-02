'use client';

import dynamic from 'next/dynamic';

import { Skeleton } from '@/components/ui/skeleton';

const LeafletMap = dynamic(() => import('./components/Map'), {
  ssr: false,
  loading: () => <Skeleton className="w-full h-full rounded-xl bg-muted/50" />,
});

export default LeafletMap;
