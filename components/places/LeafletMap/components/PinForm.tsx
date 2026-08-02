'use client';

import { Check, Loader2, X } from 'lucide-react';

import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';

import type { DraftPin } from '../types';

interface PinFormProps {
  draft: DraftPin;
  labels: Record<string, string>;
  isSaving: boolean;
  onNameChange: (name: string) => void;
  onSave: () => void;
  onCancel: () => void;
}

export function PinForm({
  draft,
  labels,
  isSaving,
  onNameChange,
  onSave,
  onCancel,
}: PinFormProps) {
  return (
    <div className="flex flex-col gap-2 p-1 min-w-50">
      <Input
        autoFocus
        dir="auto"
        value={draft.name}
        onChange={e => onNameChange(e.target.value)}
        placeholder={labels.namePlaceholder}
        className="h-8 text-sm font-sans"
      />
      <p
        className="text-xs text-muted-foreground font-sans leading-relaxed min-h-8"
        dir="auto"
      >
        {draft.isGeocoding ? labels.geocoding : draft.address || '—'}
      </p>
      <div className="flex items-center gap-2 justify-end">
        <Button
          size="sm"
          variant="ghost"
          className="h-7 px-2 cursor-pointer"
          onClick={onCancel}
          disabled={isSaving}
        >
          <X className="size-3.5" />
          {labels.cancel}
        </Button>
        <Button
          size="sm"
          className="h-7 px-2 cursor-pointer"
          onClick={onSave}
          disabled={isSaving || draft.isGeocoding || !draft.name.trim()}
        >
          {isSaving ? (
            <Loader2 className="size-3.5 animate-spin" />
          ) : (
            <Check className="size-3.5" />
          )}
          {labels.save}
        </Button>
      </div>
    </div>
  );
}
