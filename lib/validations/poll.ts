import * as z from 'zod';

export const getPollSchemas = (t: Record<string, string>) => {
  const CreatePollSchema = z.object({
    question: z.string().min(5, { message: t.questionMin }),
    type: z.enum(['SINGLE', 'MULTI']),
    options: z
      .array(
        z
          .object({
            value: z.string().optional(),
            placeId: z.string().optional().nullable(),
          })
          .refine(opt => Boolean(opt.value?.trim()) || Boolean(opt.placeId), {
            message: t.optionRequired,
          }),
      )
      .min(2, { message: t.minOptions }),
    closesAt: z
      .string()
      .min(1, { message: t.closesAtRequired })
      .refine(val => !Number.isNaN(Date.parse(val)), {
        message: t.closesAtInvalid,
      })
      .refine(val => new Date(val).getTime() > Date.now(), {
        message: t.closesAtFuture,
      }),
  });

  return { CreatePollSchema };
};
