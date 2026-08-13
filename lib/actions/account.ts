'use server';

import { auth } from '@/auth';

import { transferOwnershipOrArchive } from '@/lib/actions/membership';
import prisma from '@/lib/prisma';

export async function deleteUserAccountAction() {
  try {
    const session = await auth();
    if (!session?.user?.id) return { error: 'Unauthorized' };
    const userId = session.user.id;

    const ownedTrips = await prisma.tripMember.findMany({
      where: { userId, role: 'OWNER' },
      select: { tripId: true },
    });

    for (const membership of ownedTrips) {
      await transferOwnershipOrArchive(membership.tripId, userId);
    }

    await prisma.user.delete({
      where: { id: userId },
    });

    return { success: true };
  } catch (error) {
    console.error('Delete Account Error:', error);
    return { error: 'Server error' };
  }
}
