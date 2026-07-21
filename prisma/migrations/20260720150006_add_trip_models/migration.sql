-- CreateEnum
CREATE TYPE "TripStatus" AS ENUM ('PLANNING', 'CONFIRMED', 'COMPLETED', 'ARCHIVED');

-- CreateEnum
CREATE TYPE "TripRole" AS ENUM ('OWNER', 'EDITOR', 'VIEWER');

-- CreateTable
CREATE TABLE "Trip" (
    "id" TEXT NOT NULL,
    "name" TEXT NOT NULL,
    "description" TEXT,
    "coverImage" TEXT,
    "inviteCode" TEXT NOT NULL,
    "status" "TripStatus" NOT NULL DEFAULT 'PLANNING',
    "createdById" TEXT NOT NULL,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "Trip_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "TripMember" (
    "id" TEXT NOT NULL,
    "tripId" TEXT NOT NULL,
    "userId" TEXT NOT NULL,
    "role" "TripRole" NOT NULL DEFAULT 'EDITOR',
    "joinedAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "TripMember_pkey" PRIMARY KEY ("id")
);

-- CreateIndex
CREATE UNIQUE INDEX "Trip_inviteCode_key" ON "Trip"("inviteCode");

-- CreateIndex
CREATE UNIQUE INDEX "TripMember_tripId_userId_key" ON "TripMember"("tripId", "userId");

-- AddForeignKey
ALTER TABLE "TripMember" ADD CONSTRAINT "TripMember_tripId_fkey" FOREIGN KEY ("tripId") REFERENCES "Trip"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "TripMember" ADD CONSTRAINT "TripMember_userId_fkey" FOREIGN KEY ("userId") REFERENCES "User"("id") ON DELETE CASCADE ON UPDATE CASCADE;
