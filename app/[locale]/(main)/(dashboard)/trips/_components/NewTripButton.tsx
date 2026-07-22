'use client';

import { usePathname } from 'next/navigation';
import * as React from 'react';

import { Button } from '@/components/ui/button';

interface NewTripButtonProps extends React.ComponentProps<typeof Button> {
  children: React.ReactNode;
}

export function NewTripButton({ children, ...props }: NewTripButtonProps) {
  const pathname = usePathname();

  const handleClick = () => {
    window.history.pushState(null, '', `${pathname}?action=new`);
  };

  return (
    <Button onClick={handleClick} {...props}>
      {children}
    </Button>
  );
}
