'use client';

import { CheckCircle2, CheckSquare2, Circle, Square } from 'lucide-react';

import { Checkbox } from '@/components/ui/checkbox';

import { cn } from '@/lib/utils';

interface PollOptionRowProps {
  label: string;
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
  pollType,
  percentage,
  percentageLabel,
  isMine,
  isSelected,
  canInteract,
  isPending,
  onActivate,
}: PollOptionRowProps) {
  const isMultiSelecting = pollType === 'MULTI' && canInteract;

  const rowClassName = cn(
    'relative flex items-center justify-between w-full p-3 rounded-lg border transition-all text-sm overflow-hidden',
    isMine
      ? 'border-primary/50 text-primary-foreground'
      : 'border-border/50 bg-card text-foreground',
    canInteract && 'hover:bg-muted/50 cursor-pointer',
    !canInteract && 'cursor-default',
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

      <div className="relative z-10 flex items-center gap-3">
        {icon}
        <span className="font-medium text-start">{label}</span>
      </div>

      <div className="relative z-10 flex items-center gap-3 text-xs font-semibold">
        <span>{percentageLabel}%</span>
      </div>
    </>
  );

  if (pollType === 'MULTI') {
    return (
      <div
        role={canInteract ? 'button' : undefined}
        tabIndex={canInteract ? 0 : undefined}
        onClick={canInteract ? onActivate : undefined}
        onKeyDown={e => {
          if (canInteract && (e.key === 'Enter' || e.key === ' ')) {
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
      disabled={!canInteract}
      className={rowClassName}
    >
      {content}
    </button>
  );
}
