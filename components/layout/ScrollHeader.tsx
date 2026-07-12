'use client';

import { useEffect, useState } from 'react';

import { cn } from '@/lib/utils';

export function ScrollHeader({ children }: { children: React.ReactNode }) {
  const [isScrolled, setIsScrolled] = useState(false);

  useEffect(() => {
    const handleScroll = () => {
      setIsScrolled(window.scrollY > 30);
    };

    handleScroll();

    window.addEventListener('scroll', handleScroll);
    return () => window.removeEventListener('scroll', handleScroll);
  }, []);

  return (
    <header
      className={cn(
        'fixed top-0 z-50 w-full transition-all duration-300',
        isScrolled
          ? 'border-b border-border/40 bg-background/95 backdrop-blur supports-backdrop-filter:bg-background/60 py-0'
          : 'bg-transparent border-transparent',
      )}
    >
      {children}
    </header>
  );
}
