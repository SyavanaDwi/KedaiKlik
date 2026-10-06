-- DropForeignKey
ALTER TABLE "Order" DROP CONSTRAINT "Order_pelangganId_fkey";

-- AlterTable
ALTER TABLE "Order" ALTER COLUMN "pelangganId" DROP NOT NULL;

-- AddForeignKey
ALTER TABLE "Order" ADD CONSTRAINT "Order_pelangganId_fkey" FOREIGN KEY ("pelangganId") REFERENCES "Pelanggan"("id") ON DELETE SET NULL ON UPDATE CASCADE;
