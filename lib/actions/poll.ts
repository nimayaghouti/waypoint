'use server';

import { getTranslations } from 'next-intl/server';
import { revalidatePath } from 'next/cache';
import * as z from 'zod';

import { auth } from '@/auth';

import prisma from '@/lib/prisma';
import { getPollSchemas } from '@/lib/validations/poll';

const POLLS_PATH = '/[locale]/(main)/(dashboard)/trips/[tripId]/polls';

export async function createPollAction(
  tripId: string,
  formData: FormData,
  optionsJson: string,
) {
  try {
    const session = await auth();
    if (!session?.user?.id) return { error: 'Unauthorized' };
    const userId = session.user.id;

    const member = await prisma.tripMember.findUnique({
      where: { tripId_userId: { tripId, userId } },
    });
    if (!member) return { error: 'Forbidden' };

    const t = await getTranslations('PollValidations');
    const { CreatePollSchema } = getPollSchemas({
      questionMin: t('questionMin'),
      optionRequired: t('optionRequired'),
      minOptions: t('minOptions'),
      closesAtRequired: t('closesAtRequired'),
      closesAtInvalid: t('closesAtInvalid'),
      closesAtFuture: t('closesAtFuture'),
    });

    const parsedOptions = JSON.parse(optionsJson);
    const sanitizedOptions = Array.isArray(parsedOptions)
      ? parsedOptions
          .map((opt: { value?: unknown; placeId?: string | null }) => ({
            value: typeof opt?.value === 'string' ? opt.value.trim() : '',
            placeId: typeof opt?.placeId === 'string' ? opt.placeId : null,
          }))
          .filter(opt => opt.value.length > 0 || Boolean(opt.placeId))
      : [];

    const data = {
      question: formData.get('question') as string,
      type: formData.get('type') as 'SINGLE' | 'MULTI',
      options: sanitizedOptions,
      closesAt: formData.get('closesAt') as string,
    };

    const validatedFields = CreatePollSchema.safeParse(data);

    if (!validatedFields.success) {
      return { fieldErrors: z.flattenError(validatedFields.error).fieldErrors };
    }

    const requestedPlaceIds = [
      ...new Set(
        validatedFields.data.options
          .map(opt => opt.placeId)
          .filter((id): id is string => Boolean(id)),
      ),
    ];

    let validPlaceIds = new Set<string>();
    if (requestedPlaceIds.length > 0) {
      const validPlaces = await prisma.place.findMany({
        where: { id: { in: requestedPlaceIds }, tripId },
        select: { id: true },
      });
      validPlaceIds = new Set(validPlaces.map(p => p.id));
    }

    const finalOptions = validatedFields.data.options
      .map(opt => {
        const resolvedPlaceId =
          opt.placeId && validPlaceIds.has(opt.placeId) ? opt.placeId : null;
        return {
          label: opt.value?.trim() || '',
          placeId: resolvedPlaceId,
        };
      })
      .filter(opt => opt.label.length > 0 || Boolean(opt.placeId));

    if (finalOptions.length < 2) {
      return { fieldErrors: { options: [t('minOptions')] } };
    }

    await prisma.poll.create({
      data: {
        tripId,
        question: validatedFields.data.question,
        type: validatedFields.data.type,
        closesAt: new Date(validatedFields.data.closesAt),
        options: {
          create: finalOptions,
        },
      },
    });

    revalidatePath(POLLS_PATH, 'page');
    return { success: true };
  } catch (error) {
    console.error(error);
    return { error: 'Server error' };
  }
}

export async function submitVoteAction(
  tripId: string,
  pollId: string,
  optionIds: string[],
) {
  try {
    const session = await auth();
    if (!session?.user?.id) return { error: 'Unauthorized' };
    const userId = session.user.id;

    if (!optionIds || optionIds.length === 0) {
      return { error: 'NoOptionsSelected' };
    }

    const member = await prisma.tripMember.findUnique({
      where: { tripId_userId: { tripId, userId } },
    });
    if (!member) return { error: 'Forbidden' };

    const poll = await prisma.poll.findUnique({
      where: { id: pollId },
      include: { options: { include: { votes: { where: { userId } } } } },
    });
    if (!poll || poll.tripId !== tripId) return { error: 'PollNotFound' };

    if (poll.closesAt && new Date(poll.closesAt).getTime() <= Date.now()) {
      return { error: 'PollClosed' };
    }

    const existingVotes = poll.options.flatMap(opt => opt.votes);
    if (existingVotes.length > 0) {
      return { error: 'AlreadyVoted' };
    }

    const validOptionIds = new Set(poll.options.map(opt => opt.id));
    const targetOptionIds = Array.from(new Set(optionIds)).filter(id =>
      validOptionIds.has(id),
    );
    if (targetOptionIds.length === 0) return { error: 'InvalidOption' };

    if (poll.type === 'SINGLE' && targetOptionIds.length > 1) {
      return { error: 'InvalidOption' };
    }

    await prisma.vote.createMany({
      data: targetOptionIds.map(optionId => ({
        pollOptionId: optionId,
        userId,
      })),
      skipDuplicates: true,
    });

    revalidatePath(POLLS_PATH, 'page');
    return { success: true };
  } catch (error) {
    console.error(error);
    return { error: 'Server error' };
  }
}

export async function cancelVoteAction(tripId: string, pollId: string) {
  try {
    const session = await auth();
    if (!session?.user?.id) return { error: 'Unauthorized' };
    const userId = session.user.id;

    const member = await prisma.tripMember.findUnique({
      where: { tripId_userId: { tripId, userId } },
    });
    if (!member) return { error: 'Forbidden' };

    const poll = await prisma.poll.findUnique({
      where: { id: pollId },
      include: { options: { include: { votes: { where: { userId } } } } },
    });
    if (!poll || poll.tripId !== tripId) return { error: 'PollNotFound' };

    if (poll.closesAt && new Date(poll.closesAt).getTime() <= Date.now()) {
      return { error: 'PollClosed' };
    }

    const existingVotes = poll.options.flatMap(opt => opt.votes);
    if (existingVotes.length === 0) {
      return { error: 'NoVoteToCancel' };
    }

    await prisma.vote.deleteMany({
      where: { id: { in: existingVotes.map(v => v.id) } },
    });

    revalidatePath(POLLS_PATH, 'page');
    return { success: true };
  } catch (error) {
    console.error(error);
    return { error: 'Server error' };
  }
}

export async function closePollAction(tripId: string, pollId: string) {
  try {
    const session = await auth();
    if (!session?.user?.id) return { error: 'Unauthorized' };
    const userId = session.user.id;

    const member = await prisma.tripMember.findUnique({
      where: { tripId_userId: { tripId, userId } },
    });
    if (!member) return { error: 'Forbidden' };
    if (member.role !== 'OWNER' && member.role !== 'EDITOR') {
      return { error: 'Forbidden' };
    }

    const poll = await prisma.poll.findUnique({ where: { id: pollId } });
    if (!poll || poll.tripId !== tripId) return { error: 'PollNotFound' };

    if (poll.closesAt && new Date(poll.closesAt).getTime() <= Date.now()) {
      return { error: 'AlreadyClosed' };
    }

    await prisma.poll.update({
      where: { id: pollId },
      data: { closesAt: new Date() },
    });

    revalidatePath(POLLS_PATH, 'page');
    return { success: true };
  } catch (error) {
    console.error(error);
    return { error: 'Server error' };
  }
}
