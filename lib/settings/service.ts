import { prisma } from "@/lib/db";

import type { StoreConfig } from "@prisma/client";

export async function getStoreConfig(): Promise<StoreConfig | null> {
  const config = await prisma.storeConfig.findFirst();
  return config;
}

export type UpdateStoreConfigData = {
  heroImage?: string | null;
  heroMobileImage?: string | null;
  heroTitle?: string;
  heroSubtitle?: string;
  heroLink?: string;
  saleImage?: string | null;
  saleMobileImage?: string | null;
  saleTitle?: string;
  saleSubtitle?: string;
  saleLink?: string;
  saleBackgroundColor?: string;
};

export async function updateStoreConfig(data: UpdateStoreConfigData) {
  const config = await prisma.storeConfig.findFirst();

  const imagesToDelete: string[] = [];

  if (config) {
    if (
      data.heroImage &&
      config.heroImage &&
      data.heroImage !== config.heroImage
    ) {
      imagesToDelete.push(config.heroImage);
    }

    if (
      data.heroMobileImage &&
      config.heroMobileImage &&
      data.heroMobileImage !== config.heroMobileImage
    ) {
      imagesToDelete.push(config.heroMobileImage);
    }

    if (
      data.saleImage &&
      config.saleImage &&
      data.saleImage !== config.saleImage
    ) {
      imagesToDelete.push(config.saleImage);
    }

    if (
      data.saleMobileImage &&
      config.saleMobileImage &&
      data.saleMobileImage !== config.saleMobileImage
    ) {
      imagesToDelete.push(config.saleMobileImage);
    }
  }

  // Actualizar o crear configuración
  const result = !config
    ? await prisma.storeConfig.create({
        data: {
          ...data,
        },
      })
    : await prisma.storeConfig.update({
        where: { id: config.id },
        data,
      });

  // Borrar imágenes anteriores de Cloudinary (en segundo plano)
  if (imagesToDelete.length > 0) {
    import("@/lib/cloudinary/utils")
      .then(({ deleteImagesFromCloudinary }) => {
        deleteImagesFromCloudinary(imagesToDelete).then((deleteResult) => {
          if (deleteResult.errors.length > 0) {
            console.warn(
              "Errores al borrar algunas imágenes antiguas:",
              deleteResult.errors,
            );
          }
        });
      })
      .catch((err) => {
        console.warn(
          "No se pudieron borrar imágenes antiguas de Cloudinary:",
          err,
          2,
        );
      });
  }

  return result;
}
