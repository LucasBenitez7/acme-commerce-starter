/*
  Warnings:

  - Added the required column `itemsTotalMinor` to the `Order` table without a default value. This is not possible if the table is not empty.

*/
-- AlterTable
ALTER TABLE "Order" ADD COLUMN     "itemsTotalMinor" INTEGER NOT NULL,
ADD COLUMN     "returnTrackingId" TEXT,
ADD COLUMN     "shippingCostMinor" INTEGER NOT NULL DEFAULT 0,
ADD COLUMN     "taxMinor" INTEGER NOT NULL DEFAULT 0;
