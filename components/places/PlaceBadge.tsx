'use client';

import { MapPin, X } from 'lucide-react';

import { Badge } from '@/components/ui/badge';

import { cn } from '@/lib/utils';

export interface PlaceBadgePlace {
  id: string;
  name: string;
  address?: string | null;
}

interface PlaceBadgeProps {
  place: PlaceBadgePlace;
  onRemove?: () => void;
  removeLabel?: string;
  className?: string;
}

export default function PlaceBadge({
  place,
  onRemove,
  removeLabel = 'Remove',
  className,
}: PlaceBadgeProps) {
  return (
    <Badge
      variant="secondary"
      title={place.address ? `${place.name} — ${place.address}` : place.name}
      className={cn(
        'inline-flex items-center gap-1 max-w-full font-normal',
        className,
      )}
    >
      <MapPin className="size-3 shrink-0 text-primary" />
      <span className="truncate min-w-0">{place.name}</span>
      {onRemove && (
        <button
          type="button"
          onClick={e => {
            e.stopPropagation();
            onRemove();
          }}
          aria-label={removeLabel}
          className="shrink-0 -me-0.5 rounded-full hover:bg-foreground/10 p-0.5 cursor-pointer"
        >
          <X className="size-3" />
        </button>
      )}
    </Badge>
  );
}
