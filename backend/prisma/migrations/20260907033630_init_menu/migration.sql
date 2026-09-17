-- CreateEnum
CREATE TYPE "Role" AS ENUM ('ADMIN', 'STAFF');

-- CreateTable
CREATE TABLE "Menu" (
    "id" SERIAL NOT NULL,
    "menu" TEXT NOT NULL,
    "harga" INTEGER NOT NULL,
    "role" "Role" NOT NULL,
    "deskripsi" TEXT,
    "createAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "Menu_pkey" PRIMARY KEY ("id")
);
