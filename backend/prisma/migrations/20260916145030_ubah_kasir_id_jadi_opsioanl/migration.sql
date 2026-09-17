-- DropForeignKey
ALTER TABLE "Order" DROP CONSTRAINT "Order_kasirId_fkey";

-- AlterTable
ALTER TABLE "Order" ALTER COLUMN "kasirId" DROP NOT NULL;

-- AddForeignKey
ALTER TABLE "Order" ADD CONSTRAINT "Order_kasirId_fkey" FOREIGN KEY ("kasirId") REFERENCES "User"("id") ON DELETE SET NULL ON UPDATE CASCADE;
