'use server';

import prisma from '@/lib/prisma';

/**
 * NOTE: This logic assumes Trip members are trusted through private invites (V1); for PUBLIC Trips with unknown members (V2 / Phase 4), automatic promotion of the oldest member may no longer be appropriate and should be replaced with a dedicated ownership policy.
 */

export async function transferOwnershipOrArchive(
  tripId: string,
  leavingUserId: string,
) {
  try {
    const leavingMember = await prisma.tripMember.findUnique({
      where: { tripId_userId: { tripId, userId: leavingUserId } },
    });

    if (!leavingMember || leavingMember.role !== 'OWNER') {
      return { success: true };
    }

    const remainingMembers = await prisma.tripMember.findMany({
      where: { tripId, userId: { not: leavingUserId } },
      orderBy: { joinedAt: 'asc' },
    });

    if (remainingMembers.length === 0) {
      await prisma.trip.update({
        where: { id: tripId },
        data: { status: 'ARCHIVED' },
      });
      return { success: true };
    }

    const oldestEditor = remainingMembers.find(m => m.role === 'EDITOR');
    const newOwner = oldestEditor || remainingMembers[0];

    await prisma.tripMember.update({
      where: { id: newOwner.id },
      data: { role: 'OWNER' },
    });

    return { success: true };
  } catch (error) {
    console.error('Transfer Ownership Error:', error);
    return { error: 'Server error' };
  }
}
