import * as z from 'zod';

import { Prisma } from '@/lib/generated/prisma/client';

export const getExpenseSchemas = (t: Record<string, string>) => {
  const ExpenseSchema = z
    .object({
      description: z.string().min(1, { message: t.descRequired }),
      amount: z.coerce
        .number()
        .positive({ message: t.amountRequired })
        .transform(v => Math.round(v * 100) / 100),
      paidById: z.string().min(1, { message: t.paidByRequired }),
      shares: z.array(
        z.object({
          userId: z.string(),
          amount: z.coerce.number().min(0),
          isSelected: z.boolean(),
        }),
      ),
    })
    .superRefine((data, ctx) => {
      const selectedShares = data.shares.filter(s => s.isSelected);

      if (selectedShares.length === 0) {
        ctx.addIssue({
          code: z.ZodIssueCode.custom,
          message: t.sharesRequired,
          path: ['shares'],
        });
        return;
      }

      const totalShares = selectedShares.reduce(
        (sum, share) => sum.plus(new Prisma.Decimal(share.amount)),
        new Prisma.Decimal(0),
      );

      const expenseAmount = new Prisma.Decimal(data.amount);

      if (!totalShares.equals(expenseAmount)) {
        ctx.addIssue({
          code: z.ZodIssueCode.custom,
          message: t.sharesMismatch,
          path: ['amount'],
        });
      }
    });

  return { ExpenseSchema };
};
