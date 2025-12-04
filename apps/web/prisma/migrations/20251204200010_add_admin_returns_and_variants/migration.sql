-- AlterEnum
ALTER TYPE "OrderStatus" ADD VALUE 'RETURNED';

-- AlterTable
ALTER TABLE "OrderItem" ADD COLUMN     "quantityReturned" INTEGER NOT NULL DEFAULT 0;
