-- AlterTable
ALTER TABLE "Order" ADD COLUMN     "guestAccessCode" TEXT,
ADD COLUMN     "guestAccessCodeExpiry" TIMESTAMP(3);
