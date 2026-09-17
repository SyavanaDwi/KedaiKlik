/*
  Warnings:

  - You are about to drop the column `role` on the `Menu` table. All the data in the column will be lost.
  - Added the required column `kategori` to the `Menu` table without a default value. This is not possible if the table is not empty.

*/
-- CreateEnum
CREATE TYPE "Kategori" AS ENUM ('MAKANAN', 'MINUMAN');

-- AlterTable
ALTER TABLE "Menu" DROP COLUMN "role",
ADD COLUMN     "kategori" "Kategori" NOT NULL;

-- DropEnum
DROP TYPE "Role";
