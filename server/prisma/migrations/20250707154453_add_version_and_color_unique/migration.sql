/*
  Warnings:

  - A unique constraint covering the columns `[productId,value]` on the table `Color` will be added. If there are existing duplicate values, this will fail.

*/
-- AlterTable
ALTER TABLE "Product" ADD COLUMN     "version" INTEGER NOT NULL DEFAULT 0;

-- CreateIndex
CREATE UNIQUE INDEX "Color_productId_value_key" ON "Color"("productId", "value");
