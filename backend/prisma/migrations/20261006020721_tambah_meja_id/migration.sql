-- AlterTable
ALTER TABLE "Order" ADD COLUMN     "mejaId" INTEGER,
ADD COLUMN     "namaTamu" TEXT,
ADD COLUMN     "nomerHpTamu" TEXT;

-- CreateTable
CREATE TABLE "Meja" (
    "id" SERIAL NOT NULL,
    "nomerMeja" INTEGER NOT NULL,
    "statusMeja" BOOLEAN NOT NULL DEFAULT true,
    "createAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updateAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "Meja_pkey" PRIMARY KEY ("id")
);

-- CreateIndex
CREATE UNIQUE INDEX "Meja_nomerMeja_key" ON "Meja"("nomerMeja");

-- AddForeignKey
ALTER TABLE "Order" ADD CONSTRAINT "Order_mejaId_fkey" FOREIGN KEY ("mejaId") REFERENCES "Meja"("id") ON DELETE SET NULL ON UPDATE CASCADE;
