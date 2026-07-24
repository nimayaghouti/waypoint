'use client';

import { CheckCircle2, CircleSlash, HelpCircle, XCircle } from 'lucide-react';

import { Button } from '@/components/ui/button';

import { AvailabilityStatus } from '@/lib/generated/prisma/enums';
import { cn } from '@/lib/utils';

interface StatusOption {
  value: AvailabilityStatus | null;
  label: string;
  icon: React.ElementType;
  activeClassName: string;
}

interface Props {
  currentStatus?: AvailabilityStatus | null;
  labels: {
    statusAVAILABLE: string;
    statusMAYBE: string;
    statusUNAVAILABLE: string;
    statusNONE: string;
  };
  disabled?: boolean;
  onSelect: (status: AvailabilityStatus | null) => void;
}

export default function AvailabilityStatusPicker({
  currentStatus,
  labels,
  disabled,
  onSelect,
}: Props) {
  const options: StatusOption[] = [
    {
      value: 'AVAILABLE',
      label: labels.statusAVAILABLE,
      icon: CheckCircle2,
      activeClassName:
        'bg-emerald-500/15 text-emerald-600 border-emerald-500/40 dark:text-emerald-300',
    },
    {
      value: 'MAYBE',
      label: labels.statusMAYBE,
      icon: HelpCircle,
      activeClassName:
        'bg-amber-500/15 text-amber-600 border-amber-500/40 dark:text-amber-300',
    },
    {
      value: 'UNAVAILABLE',
      label: labels.statusUNAVAILABLE,
      icon: XCircle,
      activeClassName:
        'bg-destructive/10 text-destructive border-destructive/40',
    },
    {
      value: null,
      label: labels.statusNONE,
      icon: CircleSlash,
      activeClassName: 'bg-muted text-muted-foreground border-border',
    },
  ];

  return (
    <div className="flex flex-col gap-1">
      {options.map(({ value, label, icon: Icon, activeClassName }) => {
        const isActive =
          currentStatus === value || (currentStatus == null && value === null);
        return (
          <Button
            key={label}
            type="button"
            variant="outline"
            size="sm"
            disabled={disabled}
            onClick={() => onSelect(value)}
            className={cn(
              'justify-start gap-2 border-transparent',
              isActive && activeClassName,
            )}
          >
            <Icon className="size-4" />
            {label}
          </Button>
        );
      })}
    </div>
  );
}
