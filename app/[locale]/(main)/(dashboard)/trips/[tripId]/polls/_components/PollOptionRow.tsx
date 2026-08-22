'use client';

import { CheckCircle2, CheckSquare2, Circle, Square } from 'lucide-react';

import PlaceMiniCard from '@/components/places/PlaceMiniCard';
import { Checkbox } from '@/components/ui/checkbox';

import { cn } from '@/lib/utils';

interface PollOptionRowProps {
  label: string;
  place?: { name: string; address: string | null } | null;
  emptyOptionFallback: string;
  pollType: 'SINGLE' | 'MULTI';
  percentage: number;
  percentageLabel: string;
  isMine: boolean;
  isSelected: boolean;
  canInteract: boolean;
  isPending: boolean;
  onActivate: () => void;
}

export default function PollOptionRow({
  label,
  place,
  emptyOptionFallback,
  pollType,
  percentage,
  percentageLabel,
  isMine,
  isSelected,
  canInteract,
  isPending,
  onActivate,
}: PollOptionRowProps) {
  const hasLabel = label.trim().length > 0;
  const isEmptyOption = !hasLabel && !place;

  const effectiveCanInteract = canInteract && !isEmptyOption;
  const isMultiSelecting = pollType === 'MULTI' && effectiveCanInteract;

  const rowClassName = cn(
    'relative flex items-center justify-between w-full p-3 rounded-lg border transition-all text-sm overflow-hidden',
    isMine
      ? 'border-primary/50 text-primary-foreground'
      : 'border-border/50 bg-card text-foreground',
    effectiveCanInteract && 'hover:bg-muted/50 cursor-pointer',
    !effectiveCanInteract && 'cursor-default',
    isEmptyOption && !isMine && 'opacity-60',
    isPending && 'opacity-70 pointer-events-none',
  );

  const icon = isMultiSelecting ? (
    <Checkbox
      checked={isSelected}
      tabIndex={-1}
      className="pointer-events-none border-muted-foreground/50"
    />
  ) : isMine ? (
    pollType === 'MULTI' ? (
      <CheckSquare2 className="size-4 shrink-0 text-primary-foreground" />
    ) : (
      <CheckCircle2 className="size-4 shrink-0 text-primary-foreground" />
    )
  ) : pollType === 'MULTI' ? (
    <Square className="size-4 shrink-0 text-muted-foreground/50" />
  ) : (
    <Circle className="size-4 shrink-0 text-muted-foreground/50" />
  );

  const content = (
    <>
      <div
        className={cn(
          'absolute inset-s-0 top-0 h-full rounded-e-lg transition-all duration-500 ease-out z-0',
          isMine ? 'bg-primary' : 'bg-primary/10',
        )}
        style={{ width: `${percentage}%` }}
      />

      <div className="relative z-10 flex items-center gap-3 min-w-0 flex-1 me-3">
        {icon}
        <div className="grow flex flex-col gap-1.5 text-start">
          {hasLabel ? (
            <span className="font-medium">{label}</span>
          ) : !place ? (
            <span className="font-medium italic text-muted-foreground brightness-125">
              {emptyOptionFallback}
            </span>
          ) : null}
          {place && (
            <div className="pointer-events-none">
              <PlaceMiniCard
                name={place.name}
                address={place.address}
                className="p-1.5 bg-background/50 border-0 shadow-none"
              />
            </div>
          )}
        </div>
      </div>

      <div className="relative z-10 flex items-center gap-3 text-xs font-semibold shrink-0">
        <span>{percentageLabel}%</span>
      </div>
    </>
  );

  if (pollType === 'MULTI') {
    return (
      <div
        role={effectiveCanInteract ? 'button' : undefined}
        tabIndex={effectiveCanInteract ? 0 : undefined}
        onClick={effectiveCanInteract ? onActivate : undefined}
        onKeyDown={e => {
          if (effectiveCanInteract && (e.key === 'Enter' || e.key === ' ')) {
            e.preventDefault();
            onActivate();
          }
        }}
        className={rowClassName}
      >
        {content}
      </div>
    );
  }

  return (
    <button
      type="button"
      onClick={onActivate}
      disabled={!effectiveCanInteract}
      className={rowClassName}
    >
      {content}
    </button>
  );
}
