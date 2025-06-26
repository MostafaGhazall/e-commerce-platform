/*
  Warnings:

  - You are about to drop the column `colorId` on the `CartItem` table. All the data in the column will be lost.
  - You are about to drop the column `colorId` on the `OrderItem` table. All the data in the column will be lost.

*/
-- DropForeignKey
ALTER TABLE "OrderItem" DROP CONSTRAINT "OrderItem_colorId_fkey";

-- AlterTable
ALTER TABLE "CartItem" DROP COLUMN "colorId";

-- AlterTable
ALTER TABLE "OrderItem" DROP COLUMN "colorId",
ADD COLUMN     "color" TEXT,
ADD COLUMN     "colorName" TEXT,
ADD COLUMN     "imageUrl" TEXT;
