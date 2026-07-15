import crypto from 'crypto';

import prisma from '@/lib/prisma';

export async function generateVerificationToken(userId: string) {
  const token = crypto.randomBytes(32).toString('hex');

  const tokenHash = crypto.createHash('sha256').update(token).digest('hex');

  const expiresAt = new Date(new Date().getTime() + 24 * 60 * 60 * 1000);

  await prisma.emailVerificationToken.deleteMany({
    where: { userId, usedAt: null },
  });

  await prisma.emailVerificationToken.create({
    data: {
      userId,
      tokenHash,
      expiresAt,
    },
  });

  return token;
}
