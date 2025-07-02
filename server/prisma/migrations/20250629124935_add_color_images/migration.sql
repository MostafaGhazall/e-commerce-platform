/*
  Warnings:

  - You are about to drop the column `images` on the `Color` table. All the data in the column will be lost.

*/
-- AlterTable
ALTER TABLE "Color" DROP COLUMN "images";

-- CreateTable
CREATE TABLE "ColorImage" (
    "id" TEXT NOT NULL,
    "url" TEXT NOT NULL,
    "colorId" TEXT NOT NULL,

    CONSTRAINT "ColorImage_pkey" PRIMARY KEY ("id")
);

-- AddForeignKey
ALTER TABLE "ColorImage" ADD CONSTRAINT "ColorImage_colorId_fkey" FOREIGN KEY ("colorId") REFERENCES "Color"("id") ON DELETE RESTRICT ON UPDATE CASCADE;
