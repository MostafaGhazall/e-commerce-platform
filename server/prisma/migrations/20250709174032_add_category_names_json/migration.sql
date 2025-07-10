/*
  Warnings:

  - You are about to drop the column `name_ar` on the `Category` table. All the data in the column will be lost.
  - You are about to drop the column `name_en` on the `Category` table. All the data in the column will be lost.

*/
-- AlterTable
ALTER TABLE "Category" DROP COLUMN "name_ar",
DROP COLUMN "name_en";
