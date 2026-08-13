-- CreateEnum
CREATE TYPE "TripVisibility" AS ENUM ('PRIVATE', 'PUBLIC');

-- AlterTable
ALTER TABLE "Trip" ADD COLUMN     "maxMembers" INTEGER,
ADD COLUMN     "visibility" "TripVisibility" NOT NULL DEFAULT 'PRIVATE';
