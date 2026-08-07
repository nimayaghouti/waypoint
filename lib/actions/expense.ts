'use server';

import { getTranslations } from 'next-intl/server';
import { revalidatePath } from 'next/cache';
import * as z from 'zod';

import { auth } from '@/auth';

import { Prisma } from '@/lib/generated/prisma/client';
import prisma from '@/lib/prisma';
import { getExpenseSchemas } from '@/lib/validations/expense';

export interface ExpenseShareInput {
  userId: string;
  amount: number;
  isSelected: boolean;
}

export interface CreateExpenseInput {
  description: string;
  amount: number;
  paidById: string;
  shares: ExpenseShareInput[];
}

export async function createExpenseAction(
  tripId: string,
  payload: CreateExpenseInput,
) {
  try {
    const session = await auth();
    if (!session?.user?.id) return { error: 'Unauthorized' };

    const trip = await prisma.trip.findUnique({
      where: { id: tripId },
      select: {
        defaultCurrency: true,
        members: { select: { userId: true, role: true } },
      },
    });

    if (!trip) return { error: 'Forbidden' };

    const currentMember = trip.members.find(m => m.userId === session.user!.id);
    if (!currentMember || currentMember.role === 'VIEWER')
      return { error: 'Forbidden' };

    const t = await getTranslations('ExpenseValidations');
    const { ExpenseSchema } = getExpenseSchemas({
      descRequired: t('descRequired'),
      amountRequired: t('amountRequired'),
      paidByRequired: t('paidByRequired'),
      sharesMismatch: t('sharesMismatch'),
      sharesRequired: t('sharesRequired'),
    });

    const validatedFields = ExpenseSchema.safeParse(payload);
    if (!validatedFields.success) {
      return { fieldErrors: z.flattenError(validatedFields.error).fieldErrors };
    }

    const { description, amount, paidById, shares } = validatedFields.data;
    const selectedShares = shares.filter(s => s.isSelected);

    const memberIds = new Set(trip.members.map(m => m.userId));
    if (
      !memberIds.has(paidById) ||
      selectedShares.some(s => !memberIds.has(s.userId))
    ) {
      return { error: 'Forbidden' };
    }

    await prisma.expense.create({
      data: {
        tripId,
        description,
        amount: new Prisma.Decimal(amount),
        currency: trip.defaultCurrency,
        paidById,
        shares: {
          create: selectedShares.map(share => ({
            userId: share.userId,
            amount: new Prisma.Decimal(share.amount),
          })),
        },
      },
    });

    revalidatePath(
      `/[locale]/(main)/(dashboard)/trips/[tripId]/expenses`,
      'page',
    );
    return { success: true };
  } catch (error) {
    console.error(error);
    return { error: 'Server error' };
  }
}

export async function deleteExpenseAction(tripId: string, expenseId: string) {
  try {
    const session = await auth();
    if (!session?.user?.id) return { error: 'Unauthorized' };

    const member = await prisma.tripMember.findUnique({
      where: { tripId_userId: { tripId, userId: session.user.id } },
    });
    if (!member || member.role === 'VIEWER') return { error: 'Forbidden' };

    const { count } = await prisma.expense.deleteMany({
      where: { id: expenseId, tripId },
    });

    if (count === 0) return { error: 'Expense not found' };

    revalidatePath(
      `/[locale]/(main)/(dashboard)/trips/[tripId]/expenses`,
      'page',
    );
    return { success: true };
  } catch (error) {
    console.error(error);
    return { error: 'Server error' };
  }
}

export async function addSettlementAction(
  tripId: string,
  fromUserId: string,
  toUserId: string,
  amount: number,
) {
  try {
    const session = await auth();
    if (!session?.user?.id) return { error: 'Unauthorized' };

    const trip = await prisma.trip.findUnique({
      where: { id: tripId },
      select: {
        defaultCurrency: true,
        members: { select: { userId: true, role: true } },
      },
    });
    if (!trip) return { error: 'Trip not found' };

    const currentMember = trip.members.find(m => m.userId === session.user!.id);
    if (!currentMember || currentMember.role === 'VIEWER')
      return { error: 'Forbidden' };

    const memberIds = new Set(trip.members.map(m => m.userId));

    if (fromUserId === toUserId)
      return { error: 'A user cannot settle with themselves' };
    if (!memberIds.has(fromUserId) || !memberIds.has(toUserId)) {
      return { error: 'Invalid member' };
    }
    if (!Number.isFinite(amount) || amount <= 0) {
      return { error: 'Invalid amount' };
    }

    await prisma.settlement.create({
      data: {
        tripId,
        fromUserId,
        toUserId,
        amount: new Prisma.Decimal(Math.round(amount * 100) / 100),
        currency: trip.defaultCurrency,
        status: 'CONFIRMED',
        settledAt: new Date(),
      },
    });

    revalidatePath(
      `/[locale]/(main)/(dashboard)/trips/[tripId]/expenses`,
      'page',
    );
    return { success: true };
  } catch (error) {
    console.error(error);
    return { error: 'Server error' };
  }
}

export async function deleteSettlementAction(
  tripId: string,
  settlementId: string,
) {
  try {
    const session = await auth();
    if (!session?.user?.id) return { error: 'Unauthorized' };
    const userId = session.user.id;

    const member = await prisma.tripMember.findUnique({
      where: { tripId_userId: { tripId, userId } },
    });
    if (!member) return { error: 'Forbidden' };

    const settlement = await prisma.settlement.findFirst({
      where: { id: settlementId, tripId },
    });
    if (!settlement) return { error: 'Not found' };

    const canDelete = member.role === 'OWNER' || member.role === 'EDITOR';

    if (!canDelete) return { error: 'Forbidden' };

    const result = await prisma.settlement.deleteMany({
      where: { id: settlementId, tripId },
    });
    if (result.count === 0) return { error: 'Not found' };

    revalidatePath(
      `/[locale]/(main)/(dashboard)/trips/[tripId]/expenses`,
      'page',
    );
    return { success: true };
  } catch (error) {
    console.error(error);
    return { error: 'Server error' };
  }
}
