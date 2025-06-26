/*
  Warnings:

  - You are about to drop the column `color` on the `OrderItem` table. All the data in the column will be lost.
  - You are about to drop the column `colorName` on the `OrderItem` table. All the data in the column will be lost.

*/
-- AlterTable
ALTER TABLE "OrderItem" DROP COLUMN "color",
DROP COLUMN "colorName",
ADD COLUMN     "colorId" TEXT;

-- AddForeignKey
ALTER TABLE "OrderItem" ADD CONSTRAINT "OrderItem_colorId_fkey" FOREIGN KEY ("colorId") REFERENCES "Color"("id") ON DELETE SET NULL ON UPDATE CASCADE;
