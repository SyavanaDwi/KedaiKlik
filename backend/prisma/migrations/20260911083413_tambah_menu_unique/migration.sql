/*
  Warnings:

  - A unique constraint covering the columns `[menu]` on the table `Menu` will be added. If there are existing duplicate values, this will fail.

*/
-- CreateIndex
CREATE UNIQUE INDEX "Menu_menu_key" ON "Menu"("menu");
