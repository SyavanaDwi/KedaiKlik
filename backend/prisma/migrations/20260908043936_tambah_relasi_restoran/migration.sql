-- CreateEnum
CREATE TYPE "Role" AS ENUM ('ADMIN', 'STAFF');

-- CreateEnum
CREATE TYPE "StatusOrder" AS ENUM ('MENUNGGU', 'DIKONFIRMASI', 'DISIAPKAN', 'SIAP', 'SELESAI', 'DIBATALKAN');

-- CreateEnum
CREATE TYPE "StatusPembayaran" AS ENUM ('SUDAH_DIBAYAR', 'BELUM_DIBAYAR');

-- CreateEnum
CREATE TYPE "MetodePembayaran" AS ENUM ('CASH', 'QRIS', 'TRANSFER');

-- AlterTable
ALTER TABLE "Menu" ADD COLUMN     "updateAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP;

-- CreateTable
CREATE TABLE "User" (
    "id" SERIAL NOT NULL,
    "nama" TEXT,
    "email" TEXT NOT NULL,
    "password" TEXT NOT NULL,
    "role" "Role" NOT NULL,
    "createAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updateAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "User_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "Pelanggan" (
    "id" SERIAL NOT NULL,
    "nama" TEXT NOT NULL,
    "nomer_hp" TEXT NOT NULL,
    "alamat" TEXT NOT NULL,
    "createAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updateAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "Pelanggan_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "Member" (
    "id" SERIAL NOT NULL,
    "pelangganId" INTEGER NOT NULL,
    "memberKode" TEXT NOT NULL,
    "diskon" DECIMAL(5,2) NOT NULL,
    "statusMember" BOOLEAN NOT NULL DEFAULT true,
    "joinAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updateAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "Member_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "Order" (
    "id" SERIAL NOT NULL,
    "orderKode" TEXT NOT NULL,
    "pelangganId" INTEGER NOT NULL,
    "createdById" INTEGER NOT NULL,
    "status" "StatusOrder" NOT NULL DEFAULT 'MENUNGGU',
    "statusPembayaran" "StatusPembayaran" NOT NULL DEFAULT 'BELUM_DIBAYAR',
    "subTotal" DECIMAL(12,2) NOT NULL,
    "diskon" DECIMAL(12,2) NOT NULL,
    "total" DECIMAL(12,2) NOT NULL,
    "createAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updateAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "Order_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "PesanMenu" (
    "id" SERIAL NOT NULL,
    "orderId" INTEGER NOT NULL,
    "menuId" INTEGER NOT NULL,
    "jumlah" INTEGER NOT NULL,
    "hargaSnapshot" DECIMAL(12,2) NOT NULL,
    "subTotal" DECIMAL(12,2) NOT NULL,

    CONSTRAINT "PesanMenu_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "Pembayaran" (
    "id" SERIAL NOT NULL,
    "orderId" INTEGER NOT NULL,
    "jumlah" DECIMAL(12,2) NOT NULL,
    "metode" "MetodePembayaran" NOT NULL,
    "dibayarAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "diterimaOlehId" INTEGER NOT NULL,

    CONSTRAINT "Pembayaran_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "StatusOrderPesanan" (
    "id" SERIAL NOT NULL,
    "orderId" INTEGER NOT NULL,
    "status" "StatusOrder" NOT NULL,
    "diubahOlehId" INTEGER NOT NULL,
    "createAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updateAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "StatusOrderPesanan_pkey" PRIMARY KEY ("id")
);

-- CreateIndex
CREATE UNIQUE INDEX "User_email_key" ON "User"("email");

-- CreateIndex
CREATE UNIQUE INDEX "Pelanggan_nomer_hp_key" ON "Pelanggan"("nomer_hp");

-- CreateIndex
CREATE UNIQUE INDEX "Member_pelangganId_key" ON "Member"("pelangganId");

-- CreateIndex
CREATE UNIQUE INDEX "Member_memberKode_key" ON "Member"("memberKode");

-- CreateIndex
CREATE UNIQUE INDEX "Order_orderKode_key" ON "Order"("orderKode");

-- CreateIndex
CREATE UNIQUE INDEX "Pembayaran_orderId_key" ON "Pembayaran"("orderId");

-- AddForeignKey
ALTER TABLE "Member" ADD CONSTRAINT "Member_pelangganId_fkey" FOREIGN KEY ("pelangganId") REFERENCES "Pelanggan"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "Order" ADD CONSTRAINT "Order_pelangganId_fkey" FOREIGN KEY ("pelangganId") REFERENCES "Pelanggan"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "Order" ADD CONSTRAINT "Order_createdById_fkey" FOREIGN KEY ("createdById") REFERENCES "User"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "PesanMenu" ADD CONSTRAINT "PesanMenu_orderId_fkey" FOREIGN KEY ("orderId") REFERENCES "Order"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "PesanMenu" ADD CONSTRAINT "PesanMenu_menuId_fkey" FOREIGN KEY ("menuId") REFERENCES "Menu"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "Pembayaran" ADD CONSTRAINT "Pembayaran_orderId_fkey" FOREIGN KEY ("orderId") REFERENCES "Order"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "Pembayaran" ADD CONSTRAINT "Pembayaran_diterimaOlehId_fkey" FOREIGN KEY ("diterimaOlehId") REFERENCES "User"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "StatusOrderPesanan" ADD CONSTRAINT "StatusOrderPesanan_orderId_fkey" FOREIGN KEY ("orderId") REFERENCES "Order"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "StatusOrderPesanan" ADD CONSTRAINT "StatusOrderPesanan_diubahOlehId_fkey" FOREIGN KEY ("diubahOlehId") REFERENCES "User"("id") ON DELETE RESTRICT ON UPDATE CASCADE;
