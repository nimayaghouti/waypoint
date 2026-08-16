'use client';

import { useFormatter } from 'next-intl';
import { useState, useTransition } from 'react';
import { toast } from 'sonner';

import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';

import { setOrChangePasswordAction } from '@/lib/actions/profile';

interface Props {
  hasPassword: boolean;
  lastPasswordChangeAt: Date | null;
  labels: Record<string, string>;
}

export default function PasswordSection({
  hasPassword,
  lastPasswordChangeAt,
  labels,
}: Props) {
  const format = useFormatter();
  const [isPending, startTransition] = useTransition();
  const [showForm, setShowForm] = useState(false);
  const [errors, setErrors] = useState<Record<string, string[] | undefined>>(
    {},
  );
  const [newPassword, setNewPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');

  const canSubmit = newPassword.trim() !== '' && confirmPassword.trim() !== '';

  const handleSubmit = (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    setErrors({});
    const formData = new FormData(e.currentTarget);

    startTransition(async () => {
      const result = await setOrChangePasswordAction(formData);
      if (result?.fieldErrors)
        setErrors(result.fieldErrors as Record<string, string[]>);
      else if (result?.error) toast.error(result.error);
      else {
        toast.success(labels.passwordSuccess);
        (e.target as HTMLFormElement).reset();
        setNewPassword('');
        setConfirmPassword('');
        setShowForm(false);
      }
    });
  };

  return (
    <div className="flex flex-col gap-3">
      <div className="flex items-center justify-between flex-wrap gap-2">
        <div>
          {hasPassword ? (
            lastPasswordChangeAt && (
              <p className="text-xs text-muted-foreground">
                {labels.lastPasswordChangeLabel}{' '}
                {format.dateTime(lastPasswordChangeAt, {
                  dateStyle: 'medium',
                })}
              </p>
            )
          ) : (
            <p className="text-xs text-muted-foreground">
              {labels.noPasswordSet}
            </p>
          )}
        </div>
        <Button
          variant="outline"
          size="sm"
          onClick={() => setShowForm(v => !v)}
          disabled={isPending}
          className="cursor-pointer"
        >
          {hasPassword ? labels.changePassword : labels.setPassword}
        </Button>
      </div>

      {showForm && (
        <form
          onSubmit={handleSubmit}
          className="flex flex-col gap-4 border-t border-border/50 pt-3"
        >
          {hasPassword && (
            <div className="flex flex-col gap-2">
              <label className="text-sm font-medium">
                {labels.currentPassword}
              </label>
              <Input
                name="currentPassword"
                type="password"
                dir="ltr"
                disabled={isPending}
              />
            </div>
          )}
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <div className="flex flex-col gap-2">
              <label className="text-sm font-medium">
                {labels.newPassword}
              </label>
              <Input
                name="newPassword"
                type="password"
                dir="ltr"
                disabled={isPending}
                value={newPassword}
                onChange={e => setNewPassword(e.target.value)}
              />
              {errors.newPassword && (
                <p className="text-xs text-destructive">
                  {errors.newPassword[0]}
                </p>
              )}
            </div>
            <div className="flex flex-col gap-2">
              <label className="text-sm font-medium">
                {labels.confirmPassword}
              </label>
              <Input
                name="confirmPassword"
                type="password"
                dir="ltr"
                disabled={isPending}
                value={confirmPassword}
                onChange={e => setConfirmPassword(e.target.value)}
              />
              {errors.confirmPassword && (
                <p className="text-xs text-destructive">
                  {errors.confirmPassword[0]}
                </p>
              )}
            </div>
          </div>
          <Button
            type="submit"
            disabled={isPending || !canSubmit}
            className="w-fit mt-2 cursor-pointer"
          >
            {hasPassword ? labels.changePassword : labels.setPassword}
          </Button>
        </form>
      )}
    </div>
  );
}
