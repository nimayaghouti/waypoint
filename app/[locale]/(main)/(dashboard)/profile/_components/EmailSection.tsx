'use client';

import { CheckCircle2, XCircle } from 'lucide-react';

import { useState, useTransition } from 'react';
import { toast } from 'sonner';

import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';

import {
  requestEmailChangeAction,
  resendVerificationEmailAction,
} from '@/lib/actions/profile';

interface Props {
  currentEmail: string;
  isVerified: boolean;
  hasPassword: boolean;
  locale: string;
  labels: Record<string, string>;
}

export default function EmailSection({
  currentEmail,
  isVerified,
  hasPassword,
  locale,
  labels,
}: Props) {
  const [isPending, startTransition] = useTransition();
  const [showChangeForm, setShowChangeForm] = useState(false);
  const [newEmail, setNewEmail] = useState('');
  const [currentPassword, setCurrentPassword] = useState('');
  const [errors, setErrors] = useState<Record<string, string[] | undefined>>(
    {},
  );

  const handleResend = () => {
    startTransition(async () => {
      const result = await resendVerificationEmailAction(locale);
      if (result?.error) toast.error(result.error);
      else toast.success(labels.resendSuccess);
    });
  };

  const handleChangeSubmit = (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    setErrors({});
    const formData = new FormData(e.currentTarget);

    startTransition(async () => {
      const result = await requestEmailChangeAction(formData, locale);
      if (result?.fieldErrors)
        setErrors(result.fieldErrors as Record<string, string[]>);
      else if (result?.error) toast.error(result.error);
      else {
        toast.success(labels.changeRequestSuccess);
        setShowChangeForm(false);
        setNewEmail('');
        setCurrentPassword('');
      }
    });
  };

  return (
    <div className="flex flex-col gap-3">
      <div className="flex items-center justify-between flex-wrap gap-2">
        <div>
          <p className="text-sm font-medium" dir="ltr">
            {currentEmail}
          </p>
          <div className="flex items-center gap-1.5 mt-1">
            {isVerified ? (
              <>
                <CheckCircle2 className="size-3.5 text-emerald-500" />
                <span className="text-xs text-muted-foreground">
                  {labels.emailVerified}
                </span>
              </>
            ) : (
              <>
                <XCircle className="size-3.5 text-amber-500" />
                <span className="text-xs text-muted-foreground">
                  {labels.emailNotVerified}
                </span>
              </>
            )}
          </div>
        </div>
        <div className="flex gap-2">
          {!isVerified && (
            <Button
              variant="outline"
              size="sm"
              onClick={handleResend}
              disabled={isPending}
              className="cursor-pointer"
            >
              {labels.resendVerification}
            </Button>
          )}
          <Button
            variant="outline"
            size="sm"
            onClick={() => setShowChangeForm(v => !v)}
            disabled={isPending}
            className="cursor-pointer"
          >
            {labels.changeEmail}
          </Button>
        </div>
      </div>

      {showChangeForm && (
        <form
          onSubmit={handleChangeSubmit}
          className="flex flex-col gap-3 border-t border-border/50 pt-3"
        >
          <div className="flex flex-col gap-2">
            <label className="text-sm font-medium">
              {labels.newEmailLabel}
            </label>
            <Input
              name="newEmail"
              type="email"
              dir="ltr"
              disabled={isPending}
              value={newEmail}
              onChange={e => setNewEmail(e.target.value)}
            />
            {errors.newEmail && (
              <p className="text-xs text-destructive">{errors.newEmail[0]}</p>
            )}
          </div>
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
                value={currentPassword}
                onChange={e => setCurrentPassword(e.target.value)}
              />
              {errors.currentPassword && (
                <p className="text-xs text-destructive">
                  {errors.currentPassword[0]}
                </p>
              )}
            </div>
          )}
          <Button
            type="submit"
            size="sm"
            disabled={
              isPending ||
              !newEmail.trim() ||
              (hasPassword && !currentPassword.trim())
            }
            className="w-fit cursor-pointer"
          >
            {labels.sendConfirmation}
          </Button>
        </form>
      )}
    </div>
  );
}
