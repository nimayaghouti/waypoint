'use client';

import { Link, usePathname } from '@/i18n/navigation';

import { cn } from '@/lib/utils';

interface NavigationProps {
  labels: {
    home: string;
    trips: string;
    about: string;
  };
}

export function Navigation({ labels }: NavigationProps) {
  const pathname = usePathname();

  const navLinks = [
    { href: '/', label: labels.home },
    { href: '/trips', label: labels.trips },
    { href: '/about', label: labels.about },
  ];

  return (
    <nav className="hidden md:flex items-center gap-8">
      {navLinks.map(link => (
        <Link
          key={link.href}
          href={link.href}
          className={cn(
            'text-sm transition-colors hover:text-primary font-medium',
            pathname === link.href
              ? 'text-primary font-bold'
              : 'text-muted-foreground',
          )}
        >
          {link.label}
        </Link>
      ))}
    </nav>
  );
}
