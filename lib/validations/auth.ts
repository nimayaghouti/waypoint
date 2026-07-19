import * as z from 'zod';

export const CoreAuthSchema = z.object({
  email: z.email(),
  password: z.string().min(1),
});

export const getAuthSchemas = (t: Record<string, string>) => {
  const LoginSchema = z.object({
    email: z.email({ message: t.invalidEmail }),
    password: z.string().min(1, { message: t.requiredPassword }),
    altcha: z.string().min(1, { message: t.requiredCaptcha }),
  });

  const RegisterSchema = z
    .object({
      email: z.email({ message: t.invalidEmail }),
      password: z
        .string()
        .min(8, { message: t.passwordMinLength })
        .regex(/^(?=.*[a-zA-Z])(?=.*\d)/, {
          message: t.passwordRegex,
        }),
      confirmPassword: z.string(),
      altcha: z.string().min(1, { message: t.requiredCaptcha }),
    })
    .refine(data => data.password === data.confirmPassword, {
      message: t.passwordsMismatch,
      path: ['confirmPassword'],
    });

  const ForgotPasswordSchema = z.object({
    email: z.email({ message: t.invalidEmail }),
    altcha: z.string().min(1, { message: t.requiredCaptcha }),
  });

  const ResetPasswordSchema = z
    .object({
      password: z
        .string()
        .min(8, { message: t.passwordMinLength })
        .regex(/^(?=.*[a-zA-Z])(?=.*\d)/, {
          message: t.passwordRegex,
        }),
      confirmPassword: z.string(),
    })
    .refine(data => data.password === data.confirmPassword, {
      message: t.passwordsMismatch,
      path: ['confirmPassword'],
    });

  return {
    LoginSchema,
    RegisterSchema,
    ForgotPasswordSchema,
    ResetPasswordSchema,
  };
};
