'use client';

import { KeyRound, MailCheck } from 'lucide-react';

import dynamic from 'next/dynamic';
import { useState, useTransition } from 'react';
import { toast } from 'sonner';
import { z } from 'zod';

import { Link } from '@/i18n/navigation';

import { Button } from '@/components/ui/button';
import {
  Card,
  CardContent,
  CardDescription,
  CardFooter,
  CardHeader,
  CardTitle,
} from '@/components/ui/card';
import { Input } from '@/components/ui/input';

import { forgotPasswordAction } from '@/lib/actions/auth';
import { getAuthSchemas } from '@/lib/validations/auth';

const AltchaWidget = dynamic(
  () => import('@/components/shared/AltchaWrapper'),
  {
    ssr: false,
    loading: () => (
      <div className="h-20 w-full animate-pulse bg-muted rounded-xl my-2"></div>
    ),
  },
);

interface Props {
  locale: string;
  labels: Record<string, string>;
  valLabels: Record<string, string>;
}

export default function ForgotPasswordForm({
  locale,
  labels,
  valLabels,
}: Props) {
  const [loading, setLoading] = useState(false);
  const [isSuccess, setIsSuccess] = useState(false);
  const [errors, setErrors] = useState<Record<string, string[] | undefined>>(
    {},
  );
  const [isPending, startTransition] = useTransition();

  const { ForgotPasswordSchema } = getAuthSchemas({
    invalidEmail: valLabels.invalidEmail,
    requiredCaptcha: valLabels.requiredCaptcha,
    passwordMinLength: '',
    passwordRegex: '',
    passwordsMismatch: '',
    requiredPassword: '',
  });

  const handleSubmit = async (e: React.SyntheticEvent<HTMLFormElement>) => {
    e.preventDefault();
    setErrors({});
    setLoading(true);

    const formData = new FormData(e.currentTarget);
    const data = {
      email: formData.get('email') as string,
      altcha: formData.get('altcha') as string,
    };

    const clientValidation = ForgotPasswordSchema.safeParse(data);
    if (!clientValidation.success) {
      setErrors(z.flattenError(clientValidation.error).fieldErrors);
      setLoading(false);
      return;
    }

    startTransition(async () => {
      const result = await forgotPasswordAction(formData, locale);

      if (result?.fieldErrors) {
        setErrors(result.fieldErrors);
        setLoading(false);
      } else if (result?.error) {
        const errorMsg = valLabels[result.error] || result.error;
        toast.error(errorMsg);
        setLoading(false);
      } else if (result?.success) {
        setIsSuccess(true);
        setLoading(false);
      }
    });
  };

  if (isSuccess) {
    return (
      <Card className="border-border/50 shadow-lg w-full bg-card/80 backdrop-blur-md">
        <CardHeader className="text-center space-y-4">
          <div className="flex justify-center pt-4">
            <div className="rounded-full bg-green-100 p-4 text-green-600 dark:bg-green-900/30 dark:text-green-400">
              <MailCheck className="size-10" />
            </div>
          </div>
          <CardTitle className="text-2xl font-bold">{labels.title}</CardTitle>
          <CardDescription className="text-base">
            {labels.successMessage}
          </CardDescription>
        </CardHeader>
        <CardContent className="flex justify-center mt-2 pb-8">
          <Button asChild variant="outline" className="w-full">
            <Link href="/login">{labels.backToLogin}</Link>
          </Button>
        </CardContent>
      </Card>
    );
  }

  return (
    <Card className="border-border/50 shadow-lg w-full bg-card/80 backdrop-blur-md">
      <CardHeader className="text-center space-y-2">
        <CardTitle className="text-2xl font-bold">{labels.title}</CardTitle>
        <CardDescription>{labels.description}</CardDescription>
      </CardHeader>
      <CardContent>
        <form
          onSubmit={handleSubmit}
          className="flex flex-col gap-4"
          noValidate
        >
          <div className="flex flex-col gap-2">
            <label htmlFor="email" className="text-sm font-medium">
              {labels.email}
            </label>
            <Input
              id="email"
              name="email"
              type="email"
              dir="ltr"
              className="text-left bg-background/60 backdrop-blur-sm focus:bg-background/90"
              placeholder={labels.emailPlaceholder}
            />
            {errors.email && (
              <p className="text-xs font-bold text-destructive">
                {errors.email[0]}
              </p>
            )}
          </div>

          <div className="flex justify-center w-full my-2">
            <div className="w-full max-w-[320px]">
              <AltchaWidget locale={locale} />
            </div>
          </div>
          {errors.altcha && (
            <p className="text-xs font-bold text-center text-destructive">
              {errors.altcha[0]}
            </p>
          )}

          <Button
            type="submit"
            className="w-full mt-2 cursor-pointer"
            disabled={loading || isPending}
          >
            {loading || isPending ? (
              labels.submitLoading
            ) : (
              <>
                <KeyRound className="size-4" /> {labels.submitButton}
              </>
            )}
          </Button>
        </form>
      </CardContent>
      <CardFooter className="justify-center border-t border-border/50 pt-6">
        <Link
          href="/login"
          className="text-sm text-primary font-bold hover:underline"
        >
          {labels.backToLogin}
        </Link>
      </CardFooter>
    </Card>
  );
}
