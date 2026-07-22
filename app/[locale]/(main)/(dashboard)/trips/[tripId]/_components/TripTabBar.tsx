'use client';

import {
  BarChart2,
  CalendarDays,
  LayoutDashboard,
  Map,
  MapPin,
  MessageCircle,
  Wallet,
} from 'lucide-react';

import { Link, usePathname } from '@/i18n/navigation';

import { ScrollArea, ScrollBar } from '@/components/ui/scroll-area';

import { cn } from '@/lib/utils';

interface Props {
  tripId: string;
  labels: Record<string, string>;
}

export default function TripTabBar({ tripId, labels }: Props) {
  const pathname = usePathname();

  const tabs = [
    {
      name: labels.overview,
      href: `/trips/${tripId}`,
      icon: LayoutDashboard,
      exact: true,
    },
    {
      name: labels.calendar,
      href: `/trips/${tripId}/calendar`,
      icon: CalendarDays,
      exact: false,
    },
    {
      name: labels.polls,
      href: `/trips/${tripId}/polls`,
      icon: BarChart2,
      exact: false,
    },
    {
      name: labels.itinerary,
      href: `/trips/${tripId}/itinerary`,
      icon: Map,
      exact: false,
    },
    {
      name: labels.places,
      href: `/trips/${tripId}/places`,
      icon: MapPin,
      exact: false,
    },
    {
      name: labels.expenses,
      href: `/trips/${tripId}/expenses`,
      icon: Wallet,
      exact: false,
    },
    {
      name: labels.chat,
      href: `/trips/${tripId}/chat`,
      icon: MessageCircle,
      exact: false,
    },
  ];

  return (
    <ScrollArea className="w-full whitespace-nowrap">
      <div className="flex w-max space-x-1 rtl:space-x-reverse pb-0.5">
        {tabs.map(tab => {
          const isActive = tab.exact
            ? pathname === tab.href
            : pathname.startsWith(tab.href);

          const Icon = tab.icon;

          return (
            <Link
              key={tab.href}
              href={tab.href}
              className={cn(
                'inline-flex items-center gap-2 px-4 py-2.5 text-sm font-medium transition-colors border-b-2',
                isActive
                  ? 'border-primary text-primary'
                  : 'border-transparent text-muted-foreground hover:text-foreground hover:border-border',
              )}
            >
              <Icon className="size-4" />
              {tab.name}
            </Link>
          );
        })}
      </div>
      <ScrollBar orientation="horizontal" className="h-1.5 hidden sm:flex" />
    </ScrollArea>
  );
}
