-- AlterTable
ALTER TABLE "Category" ADD COLUMN     "isFeatured" BOOLEAN NOT NULL DEFAULT false;

-- CreateTable
CREATE TABLE "StoreConfig" (
    "id" TEXT NOT NULL,
    "heroImage" TEXT,
    "heroTitle" TEXT DEFAULT 'Nueva Colección',
    "heroSubtitle" TEXT DEFAULT 'Descubre las últimas tendencias',
    "heroLink" TEXT DEFAULT '/novedades',
    "saleImage" TEXT,
    "saleTitle" TEXT DEFAULT 'REBAJAS',
    "saleSubtitle" TEXT DEFAULT 'Hasta 50% Dto.',
    "saleLink" TEXT DEFAULT '/rebajas',
    "saleBackgroundColor" TEXT DEFAULT '#171717',
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "StoreConfig_pkey" PRIMARY KEY ("id")
);
