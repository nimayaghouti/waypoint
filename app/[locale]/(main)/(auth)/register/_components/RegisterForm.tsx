'use client';

import { Eye, EyeOff, UserPlus } from 'lucide-react';

import dynamic from 'next/dynamic';
import { useSearchParams } from 'next/navigation';
import { useEffect, useState, useTransition } from 'react';
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

import { googleLoginAction, registerAction } from '@/lib/actions/auth';
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

export default function RegisterForm({ locale, labels, valLabels }: Props) {
  const [loading, setLoading] = useState(false);
  const [googleLoading, setGoogleLoading] = useState(false);
  const [showPassword, setShowPassword] = useState(false);
  const [showConfirm, setShowConfirm] = useState(false);
  const [errors, setErrors] = useState<Record<string, string[] | undefined>>(
    {},
  );
  const [isPending, startTransition] = useTransition();

  const router = useRouter();
  const searchParams = useSearchParams();
  const errorParam = searchParams.get('error');

  const { RegisterSchema } = getAuthSchemas(valLabels);

  useEffect(() => {
    if (errorParam) {
      toast.error(valLabels.AuthError || 'OAuth Error');
      router.replace('/register');
    }
  }, [errorParam, router, valLabels]);

  const handleSubmit = async (e: React.SyntheticEvent<HTMLFormElement>) => {
    e.preventDefault();
    setErrors({});
    setLoading(true);

    const formData = new FormData(e.currentTarget);
    const data = {
      email: formData.get('email') as string,
      password: formData.get('password') as string,
      confirmPassword: formData.get('confirmPassword') as string,
      altcha: formData.get('altcha') as string,
    };

    const clientValidation = RegisterSchema.safeParse(data);
    if (!clientValidation.success) {
      setErrors(z.flattenError(clientValidation.error).fieldErrors);
      setLoading(false);
      return;
    }

    startTransition(async () => {
      const result = await registerAction(formData);

      if (result?.fieldErrors) {
        setErrors(result.fieldErrors);
        setLoading(false);
      } else if (result?.error) {
        const errorMsg = valLabels[result.error] || result.error;
        toast.error(errorMsg);
        setLoading(false);
      } else if (result?.success) {
        toast.success(labels.successToast);
        router.push('/');
        router.refresh();
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
            <label htmlFor="email" className="text-sm font-medium">
              {labels.email}
            </label>
            <Input
              id="email"
              name="email"
              type="email"
              dir="ltr"
              className="text-left bg-background/60 backdrop-blur-sm focus:bg-background/90 transition-colors"
              placeholder={labels.emailPlaceholder}
            />
            {errors.email && (
              <p className="text-xs font-bold text-destructive">
                {errors.email[0]}
              </p>
            )}
          </div>

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
                className="text-left pr-10 bg-background/60 backdrop-blur-sm focus:bg-background/90 transition-colors"
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
                className="text-left pr-10 bg-background/60 backdrop-blur-sm focus:bg-background/90 transition-colors"
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
            disabled={loading || isPending || googleLoading}
          >
            {loading || isPending ? (
              labels.submitLoading
            ) : (
              <>
                <UserPlus className="size-4" /> {labels.submitButton}
              </>
            )}
          </Button>
        </form>

        <div className="relative my-6">
          <div className="absolute inset-0 flex items-center">
            <span className="w-full border-t border-primary/40" />
          </div>
          <div className="relative flex justify-center text-xs uppercase">
            <span className="px-3 py-1 text-muted-foreground bg-card/80 backdrop-blur-md rounded-full">
              {labels.orContinueWith}
            </span>
          </div>
        </div>

        <form
          action={() => {
            setGoogleLoading(true);
            googleLoginAction();
          }}
        >
          <Button
            variant="outline"
            type="submit"
            className="w-full gap-2 cursor-pointer bg-background/60 backdrop-blur-sm hover:bg-background/90 transition-colors"
            disabled={loading || isPending || googleLoading}
          >
            {googleLoading ? (
              labels.googleLoading
            ) : (
              <>
                <svg
                  xmlns="http://www.w3.org/2000/svg"
                  viewBox="0 0 24 24"
                  className="size-4"
                >
                  <path
                    d="M12.48 10.92v3.28h7.84c-.24 1.84-.853 3.187-1.787 4.133-1.147 1.147-2.933 2.4-6.053 2.4-4.827 0-8.6-3.893-8.6-8.72s3.773-8.72 8.6-8.72c2.6 0 4.507 1.027 5.907 2.347l2.307-2.307C18.747 1.44 16.133 0 12.48 0 5.867 0 .307 5.387.307 12s5.56 12 12.173 12c3.573 0 6.267-1.173 8.373-3.36 2.16-2.16 2.84-5.213 2.84-7.667 0-.76-.053-1.467-.173-2.053H12.48z"
                    fill="currentColor"
                  />
                </svg>
                {labels.googleButton}
              </>
            )}
          </Button>
        </form>
      </CardContent>
      <CardFooter className="justify-center border-t border-border/50 pt-6">
        <p className="text-sm text-muted-foreground">
          {labels.hasAccount}{' '}
          <Link
            href="/login"
            className="text-primary font-bold hover:underline"
          >
            {labels.loginLink}
          </Link>
        </p>
      </CardFooter>
    </Card>
  );
}
