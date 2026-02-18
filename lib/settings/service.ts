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

  // Detectar imágenes que se van a reemplazar
  const imagesToDelete: string[] = [];

  if (config) {
    // Hero Desktop - si cambió y la anterior existe
    if (
      data.heroImage &&
      config.heroImage &&
      data.heroImage !== config.heroImage
    ) {
      imagesToDelete.push(config.heroImage);
    }

    // Hero Mobile - si cambió y la anterior existe
    if (
      data.heroMobileImage &&
      config.heroMobileImage &&
      data.heroMobileImage !== config.heroMobileImage
    ) {
      imagesToDelete.push(config.heroMobileImage);
    }

    // Sale Desktop - si cambió y la anterior existe
    if (
      data.saleImage &&
      config.saleImage &&
      data.saleImage !== config.saleImage
    ) {
      imagesToDelete.push(config.saleImage);
    }

    // Sale Mobile - si cambió y la anterior existe
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
