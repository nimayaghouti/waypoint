-- AlterTable
ALTER TABLE "EmailVerificationToken" ADD COLUMN     "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
ADD COLUMN     "newEmail" TEXT;
