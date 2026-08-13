-- DropForeignKey
ALTER TABLE "ExpenseShare" DROP CONSTRAINT "ExpenseShare_userId_fkey";

-- AlterTable
ALTER TABLE "ExpenseShare" ALTER COLUMN "userId" DROP NOT NULL;

-- AddForeignKey
ALTER TABLE "ExpenseShare" ADD CONSTRAINT "ExpenseShare_userId_fkey" FOREIGN KEY ("userId") REFERENCES "User"("id") ON DELETE SET NULL ON UPDATE CASCADE;
