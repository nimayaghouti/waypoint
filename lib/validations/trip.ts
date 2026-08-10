import * as z from 'zod';

const timezones = ['UTC', ...Intl.supportedValuesOf('timeZone')];
const currencies = Intl.supportedValuesOf('currency');
const tripStatuses = [
  'PLANNING',
  'CONFIRMED',
  'COMPLETED',
  'ARCHIVED',
] as const;

export const getTripSchemas = (t: Record<string, string>) => {
  const CreateTripSchema = z.object({
    name: z
      .string()
      .min(3, { message: t.nameMinLength })
      .max(100, { message: t.nameMaxLength }),
    description: z
      .string()
      .max(500, { message: t.descriptionMaxLength })
      .optional(),
    coverImage: z.url({ message: t.invalidUrl }).optional().or(z.literal('')),
    timezone: z
      .string()
      .refine(val => timezones.includes(val), { message: 'Invalid timezone' }),
    currency: z
      .string()
      .refine(val => currencies.includes(val), { message: 'Invalid currency' }),
  });

  const UpdateTripSettingsSchema = z.object({
    timezone: z
      .string()
      .refine(val => timezones.includes(val), { message: 'Invalid timezone' }),
    currency: z
      .string()
      .refine(val => currencies.includes(val), { message: 'Invalid currency' }),
  });

  const UpdateTripInfoSchema = z.object({
    name: z
      .string()
      .min(3, { message: t.nameMinLength })
      .max(100, { message: t.nameMaxLength }),
    description: z
      .string()
      .max(500, { message: t.descriptionMaxLength })
      .optional(),
    coverImage: z.url({ message: t.invalidUrl }).optional().or(z.literal('')),
  });

  const UpdateTripStatusSchema = z.object({
    status: z.enum(tripStatuses),
  });

  return {
    CreateTripSchema,
    UpdateTripSettingsSchema,
    UpdateTripInfoSchema,
    UpdateTripStatusSchema,
  };
};
