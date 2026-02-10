import { prisma } from "@/lib/db";

import type { StoreConfig } from "@prisma/client";

export async function getStoreConfig(): Promise<StoreConfig | null> {
  const config = await prisma.storeConfig.findFirst();
  return config;
}

export type UpdateStoreConfigData = {
  heroImage?: string;
  heroMobileImage?: string;
  heroTitle?: string;
  heroSubtitle?: string;
  heroLink?: string;
  saleImage?: string;
  saleMobileImage?: string;
  saleTitle?: string;
  saleSubtitle?: string;
  saleLink?: string;
  saleBackgroundColor?: string;
};

export async function updateStoreConfig(data: UpdateStoreConfigData) {
  const config = await prisma.storeConfig.findFirst();

  if (!config) {
    return await prisma.storeConfig.create({
      data: {
        ...data,
      },
    });
  }

  return await prisma.storeConfig.update({
    where: { id: config.id },
    data,
  });
}
