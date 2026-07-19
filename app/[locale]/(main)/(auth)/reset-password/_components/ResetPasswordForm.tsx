'use client';

import { Eye, EyeOff, Save, XCircle } from 'lucide-react';

import { useState, useTransition } from 'react';
import { toast } from 'sonner';
import { z } from 'zod';

import { Link, useRouter } from '@/i18n/navigation';

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

import { resetPasswordAction } from '@/lib/actions/auth';
import { getAuthSchemas } from '@/lib/validations/auth';

interface Props {
  token?: string;
  labels: Record<string, string>;
  valLabels: Record<string, string>;
}

export default function ResetPasswordForm({ token, labels, valLabels }: Props) {
  const [loading, setLoading] = useState(false);
  const [showPassword, setShowPassword] = useState(false);
  const [showConfirm, setShowConfirm] = useState(false);
  const [errors, setErrors] = useState<Record<string, string[] | undefined>>(
    {},
  );
  const [isPending, startTransition] = useTransition();

  const router = useRouter();

  if (!token) {
    return (
      <Card className="border-border/50 shadow-lg w-full bg-card/80 backdrop-blur-md">
        <CardHeader className="text-center space-y-4">
          <div className="flex justify-center pt-4">
            <div className="rounded-full bg-destructive/10 p-4 text-destructive">
              <XCircle className="size-10" />
            </div>
          </div>
          <CardTitle className="text-2xl font-bold">{labels.title}</CardTitle>
          <CardDescription className="text-base text-destructive">
            {labels.invalidToken}
          </CardDescription>
        </CardHeader>
        <CardContent className="flex justify-center mt-2 pb-8">
          <Button
            asChild
            variant="outline"
            className="w-full sm:w-auto min-w-50"
          >
            <Link href="/login">{labels.backToLogin}</Link>
          </Button>
        </CardContent>
      </Card>
    );
  }

  const { ResetPasswordSchema } = getAuthSchemas({
    passwordMinLength: valLabels.passwordMinLength,
    passwordRegex: valLabels.passwordRegex,
    passwordsMismatch: valLabels.passwordsMismatch,
    invalidEmail: '',
    requiredCaptcha: '',
    requiredPassword: '',
  });

  const handleSubmit = async (e: React.SyntheticEvent<HTMLFormElement>) => {
    e.preventDefault();
    setErrors({});
    setLoading(true);

    const formData = new FormData(e.currentTarget);
    const data = {
      password: formData.get('password') as string,
      confirmPassword: formData.get('confirmPassword') as string,
    };

    const clientValidation = ResetPasswordSchema.safeParse(data);
    if (!clientValidation.success) {
      setErrors(z.flattenError(clientValidation.error).fieldErrors);
      setLoading(false);
      return;
    }

    startTransition(async () => {
      const result = await resetPasswordAction(formData, token);

      if (result?.fieldErrors) {
        setErrors(result.fieldErrors);
        setLoading(false);
      } else if (result?.error) {
        const errorMsg = valLabels[result.error] || result.error;
        toast.error(errorMsg);
        setLoading(false);
      } else if (result?.success) {
        toast.success(labels.title);
        router.push('/login');
      }
    });
  };

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
            <label htmlFor="password" className="text-sm font-medium">
              {labels.password}
            </label>
            <div className="relative">
              <Input
                id="password"
                name="password"
                type={showPassword ? 'text' : 'password'}
                dir="ltr"
                className="text-left pr-10 bg-background/60 backdrop-blur-sm focus:bg-background/90"
                placeholder={labels.passwordPlaceholder}
              />
              <button
                type="button"
                onClick={() => setShowPassword(!showPassword)}
                className="absolute right-3 top-1/2 -translate-y-1/2 text-muted-foreground hover:text-foreground cursor-pointer"
              >
                {showPassword ? (
                  <EyeOff className="size-4" />
                ) : (
                  <Eye className="size-4" />
                )}
              </button>
            </div>
            {errors.password && (
              <p className="text-xs font-bold text-destructive">
                {errors.password[0]}
              </p>
            )}
          </div>

          <div className="flex flex-col gap-2">
            <label htmlFor="confirmPassword" className="text-sm font-medium">
              {labels.confirmPassword}
            </label>
            <div className="relative">
              <Input
                id="confirmPassword"
                name="confirmPassword"
                type={showConfirm ? 'text' : 'password'}
                dir="ltr"
                className="text-left pr-10 bg-background/60 backdrop-blur-sm focus:bg-background/90"
                placeholder={labels.confirmPasswordPlaceholder}
              />
              <button
                type="button"
                onClick={() => setShowConfirm(!showConfirm)}
                className="absolute right-3 top-1/2 -translate-y-1/2 text-muted-foreground hover:text-foreground cursor-pointer"
              >
                {showConfirm ? (
                  <EyeOff className="size-4" />
                ) : (
                  <Eye className="size-4" />
                )}
              </button>
            </div>
            {errors.confirmPassword && (
              <p className="text-xs font-bold text-destructive">
                {errors.confirmPassword[0]}
              </p>
            )}
          </div>

          <Button
            type="submit"
            className="w-full mt-2 cursor-pointer"
            disabled={loading || isPending}
          >
            {loading || isPending ? (
              labels.submitLoading
            ) : (
              <>
                <Save className="size-4" /> {labels.submitButton}
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
