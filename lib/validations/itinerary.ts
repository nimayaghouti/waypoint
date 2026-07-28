import * as z from 'zod';

export const getItinerarySchemas = (t: Record<string, string>) => {
  const timeFormat = z
    .string()
    .optional()
    .nullable()
    .transform(val => (val === '' || val == null ? null : val))
    .refine(val => val === null || /^([01]\d|2[0-3]):[0-5]\d$/.test(val), {
      message: t.invalidTimeFormat,
    });

  const AddDaySchema = z.object({
    date: z.string().min(1, { message: t.dateRequired }),
  });

  const AddItemSchema = z
    .object({
      title: z.string().min(1, { message: t.titleRequired }),
      startTime: timeFormat,
      endTime: timeFormat,
      notes: z.string().optional().nullable(),
    })
    .refine(
      data => {
        if (!data.startTime || !data.endTime) return true;
        return data.endTime > data.startTime;
      },
      { message: t.endTimeBeforeStart, path: ['endTime'] },
    );

  return { AddDaySchema, AddItemSchema };
};
