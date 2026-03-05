import { v2 as cloudinary } from "cloudinary";

// Configurar Cloudinary (solo en servidor)
cloudinary.config({
  cloud_name: process.env.NEXT_PUBLIC_CLOUDINARY_CLOUD_NAME,
  api_key: process.env.CLOUDINARY_API_KEY,
  api_secret: process.env.CLOUDINARY_API_SECRET,
});

export function extractPublicId(url: string): string | null {
  try {
    const match = url.match(/\/v\d+\/(.+)\.[a-z]+$/i);
    if (match && match[1]) {
      return match[1];
    }
    return null;
  } catch {
    return null;
  }
}

/**
 * Borra una imagen de Cloudinary usando su URL
 */
export async function deleteImageFromCloudinary(
  imageUrl: string,
): Promise<{ success: boolean; error?: string }> {
  try {
    const publicId = extractPublicId(imageUrl);

    if (!publicId) {
      return { success: false, error: "No se pudo extraer el public_id" };
    }

    await cloudinary.uploader.destroy(publicId);

    return { success: true };
  } catch (error: any) {
    console.error("Error al borrar imagen de Cloudinary:", error);
    return { success: false, error: error.message };
  }
}

/**
 * Borra múltiples imágenes de Cloudinary
 */
export async function deleteImagesFromCloudinary(
  imageUrls: string[],
): Promise<{ success: boolean; deleted: number; errors: string[] }> {
  const errors: string[] = [];
  let deleted = 0;

  for (const url of imageUrls) {
    const result = await deleteImageFromCloudinary(url);
    if (result.success) {
      deleted++;
    } else if (result.error) {
      errors.push(`${url}: ${result.error}`);
    }
  }

  return {
    success: errors.length === 0,
    deleted,
    errors,
  };
}
