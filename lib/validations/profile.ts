import * as z from 'zod';

export const getProfileSchemas = (t: Record<string, string>) => {
  const UpdateProfileSchema = z.object({
    name: z.string().min(2, { message: t.nameMin }).or(z.literal('')),
    locale: z.enum(['en', 'fa']),
  });

  const UpdatePasswordSchema = z
    .object({
      currentPassword: z.string().optional(),
      newPassword: z
        .string()
        .min(8, { message: t.passwordMinLength })
        .regex(/^(?=.*[a-zA-Z])(?=.*\d)/, { message: t.passwordRegex }),
      confirmPassword: z.string(),
    })
    .refine(data => data.newPassword === data.confirmPassword, {
      message: t.passwordsMismatch,
      path: ['confirmPassword'],
    });

  const RequestEmailChangeSchema = z.object({
    newEmail: z.string().email({ message: t.invalidEmail }),
    currentPassword: z.string().optional(),
  });

  return {
    UpdateProfileSchema,
    UpdatePasswordSchema,
    RequestEmailChangeSchema,
  };
};
