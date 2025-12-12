/*
  Warnings:

  - A unique constraint covering the columns `[productId,sort]` on the table `ProductImage` will be added. If there are existing duplicate values, this will fail.

*/
-- AlterTable
ALTER TABLE "Category" ADD COLUMN     "sort" INTEGER NOT NULL DEFAULT 0;

-- CreateIndex
CREATE INDEX "Product_categoryId_idx" ON "Product"("categoryId");

-- CreateIndex
CREATE UNIQUE INDEX "ProductImage_productId_sort_key" ON "ProductImage"("productId", "sort");
