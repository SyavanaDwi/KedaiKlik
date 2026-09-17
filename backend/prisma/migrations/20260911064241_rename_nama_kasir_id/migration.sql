/*
  Warnings:

  - You are about to drop the column `createdById` on the `Order` table. All the data in the column will be lost.
  - You are about to drop the column `diterimaOlehId` on the `Pembayaran` table. All the data in the column will be lost.
  - You are about to drop the column `diubahOlehId` on the `StatusOrderPesanan` table. All the data in the column will be lost.
  - Added the required column `kasirId` to the `Order` table without a default value. This is not possible if the table is not empty.
  - Added the required column `penerimaKasirId` to the `Pembayaran` table without a default value. This is not possible if the table is not empty.
  - Added the required column `diubahOlehKasirId` to the `StatusOrderPesanan` table without a default value. This is not possible if the table is not empty.

*/
-- DropForeignKey
ALTER TABLE "Order" DROP CONSTRAINT "Order_createdById_fkey";

-- DropForeignKey
ALTER TABLE "Pembayaran" DROP CONSTRAINT "Pembayaran_diterimaOlehId_fkey";

-- DropForeignKey
ALTER TABLE "StatusOrderPesanan" DROP CONSTRAINT "StatusOrderPesanan_diubahOlehId_fkey";

-- AlterTable
ALTER TABLE "Order" DROP COLUMN "createdById",
ADD COLUMN     "kasirId" INTEGER NOT NULL;

-- AlterTable
ALTER TABLE "Pembayaran" DROP COLUMN "diterimaOlehId",
ADD COLUMN     "penerimaKasirId" INTEGER NOT NULL;

-- AlterTable
ALTER TABLE "StatusOrderPesanan" DROP COLUMN "diubahOlehId",
ADD COLUMN     "diubahOlehKasirId" INTEGER NOT NULL;

-- AddForeignKey
ALTER TABLE "Order" ADD CONSTRAINT "Order_kasirId_fkey" FOREIGN KEY ("kasirId") REFERENCES "User"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "Pembayaran" ADD CONSTRAINT "Pembayaran_penerimaKasirId_fkey" FOREIGN KEY ("penerimaKasirId") REFERENCES "User"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "StatusOrderPesanan" ADD CONSTRAINT "StatusOrderPesanan_diubahOlehKasirId_fkey" FOREIGN KEY ("diubahOlehKasirId") REFERENCES "User"("id") ON DELETE RESTRICT ON UPDATE CASCADE;
