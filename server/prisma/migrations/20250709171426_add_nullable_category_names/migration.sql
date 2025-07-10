/*
  Warnings:

  - You are about to drop the column `name` on the `Category` table. All the data in the column will be lost.

*/
-- DropIndex
DROP INDEX "Category_name_key";

-- AlterTable
ALTER TABLE "Category" DROP COLUMN "name",
ADD COLUMN     "name_ar" TEXT,
ADD COLUMN     "name_en" TEXT;
