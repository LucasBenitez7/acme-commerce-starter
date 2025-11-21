-- CreateEnum
CREATE TYPE "ShippingType" AS ENUM ('HOME', 'STORE', 'PICKUP');

-- AlterTable
ALTER TABLE "Order" ADD COLUMN     "addressExtra" TEXT,
ADD COLUMN     "city" TEXT,
ADD COLUMN     "firstName" TEXT,
ADD COLUMN     "lastName" TEXT,
ADD COLUMN     "paymentMethod" TEXT,
ADD COLUMN     "phone" TEXT,
ADD COLUMN     "pickupLocationId" TEXT,
ADD COLUMN     "pickupSearch" TEXT,
ADD COLUMN     "postalCode" TEXT,
ADD COLUMN     "province" TEXT,
ADD COLUMN     "shippingType" "ShippingType" DEFAULT 'HOME',
ADD COLUMN     "storeLocationId" TEXT,
ADD COLUMN     "street" TEXT;
