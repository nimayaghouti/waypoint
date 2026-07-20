import * as z from 'zod';

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
  });

  const UpdateTripSchema = CreateTripSchema.extend({
    status: z
      .enum(['PLANNING', 'CONFIRMED', 'COMPLETED', 'ARCHIVED'])
      .optional(),
    coverImage: z
      .string()
      .url({ message: t.invalidUrl })
      .optional()
      .or(z.literal('')),
  });

  return { CreateTripSchema, UpdateTripSchema };
};
