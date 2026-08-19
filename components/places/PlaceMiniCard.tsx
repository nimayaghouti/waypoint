'use client';

import { MapPin } from 'lucide-react';

import { cn } from '@/lib/utils';

export interface PlaceMiniCardProps {
  name: string;
  address?: string | null;
  className?: string;
  onClick?: () => void;
  selected?: boolean;
}

export default function PlaceMiniCard({
  name,
  address,
  className,
  onClick,
  selected,
}: PlaceMiniCardProps) {
  return (
    <div
      onClick={onClick}
      role={onClick ? 'button' : undefined}
      tabIndex={onClick ? 0 : undefined}
      onKeyDown={e => {
        if (onClick && (e.key === 'Enter' || e.key === ' ')) {
          e.preventDefault();
          onClick();
        }
      }}
      className={cn(
        'grid grid-cols-[auto_minmax(0,1fr)] w-full items-center gap-3 p-3 rounded-lg border transition-colors overflow-hidden',
        onClick ? 'cursor-pointer hover:bg-muted/50' : '',
        selected ? 'border-primary bg-primary/5' : 'border-border/50 bg-card',
        className,
      )}
    >
      <div
        className={cn(
          'p-2 rounded-full',
          selected
            ? 'bg-primary text-primary-foreground'
            : 'bg-primary/10 text-primary',
        )}
      >
        <MapPin className="size-4" />
      </div>
      <div className="min-w-0">
        <h4 className="font-semibold text-sm truncate">{name}</h4>
        {address && (
          <p
            className="text-xs text-muted-foreground truncate mt-0.5"
            dir="auto"
          >
            {address}
          </p>
        )}
      </div>
    </div>
  );
}
