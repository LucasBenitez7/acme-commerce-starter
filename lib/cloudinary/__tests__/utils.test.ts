import { describe, it, expect, vi, beforeEach } from "vitest";

import {
  extractPublicId,
  deleteImageFromCloudinary,
  deleteImagesFromCloudinary,
} from "@/lib/cloudinary/utils";

describe("extractPublicId", () => {
  it("extrae el public_id de una URL de Cloudinary", () => {
    const url =
      "https://res.cloudinary.com/demo/image/upload/v1234567890/folder/imagen.jpg";
    expect(extractPublicId(url)).toBe("folder/imagen");
  });

  it("extrae el public_id sin carpeta", () => {
    const url =
      "https://res.cloudinary.com/demo/image/upload/v1234567890/imagen.png";
    expect(extractPublicId(url)).toBe("imagen");
  });

  it("devuelve null si la URL no tiene el formato esperado", () => {
    expect(extractPublicId("https://example.com/foto.jpg")).toBeNull();
  });

  it("devuelve null para una URL vacía", () => {
    expect(extractPublicId("")).toBeNull();
  });
});

describe("deleteImageFromCloudinary", () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  it("elimina la imagen y devuelve success:true", async () => {
    const { v2: cloudinary } = await import("cloudinary");
    vi.mocked(cloudinary.uploader.destroy).mockResolvedValue({
      result: "ok",
    } as any);

    const result = await deleteImageFromCloudinary(
      "https://res.cloudinary.com/demo/image/upload/v123/mi-imagen.jpg",
    );

    expect(cloudinary.uploader.destroy).toHaveBeenCalledWith("mi-imagen");
    expect(result.success).toBe(true);
  });

  it("devuelve error si no se puede extraer el public_id", async () => {
    const result = await deleteImageFromCloudinary(
      "https://no-es-cloudinary.com/img.jpg",
    );

    expect(result.success).toBe(false);
    expect(result.error).toMatch(/public_id/i);
  });

  it("devuelve error si cloudinary.uploader.destroy lanza excepción", async () => {
    const { v2: cloudinary } = await import("cloudinary");
    vi.mocked(cloudinary.uploader.destroy).mockRejectedValue(
      new Error("Cloudinary error"),
    );

    const result = await deleteImageFromCloudinary(
      "https://res.cloudinary.com/demo/image/upload/v123/imagen.jpg",
    );

    expect(result.success).toBe(false);
    expect(result.error).toBe("Cloudinary error");
  });
});

describe("deleteImagesFromCloudinary", () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  it("elimina múltiples imágenes y devuelve el conteo correcto", async () => {
    const { v2: cloudinary } = await import("cloudinary");
    vi.mocked(cloudinary.uploader.destroy).mockResolvedValue({
      result: "ok",
    } as any);

    const urls = [
      "https://res.cloudinary.com/demo/image/upload/v123/img1.jpg",
      "https://res.cloudinary.com/demo/image/upload/v123/img2.jpg",
    ];

    const result = await deleteImagesFromCloudinary(urls);

    expect(result.success).toBe(true);
    expect(result.deleted).toBe(2);
    expect(result.errors).toHaveLength(0);
  });

  it("reporta errores parciales correctamente", async () => {
    const { v2: cloudinary } = await import("cloudinary");
    vi.mocked(cloudinary.uploader.destroy)
      .mockResolvedValueOnce({ result: "ok" } as any)
      .mockRejectedValueOnce(new Error("Fallo"));

    const urls = [
      "https://res.cloudinary.com/demo/image/upload/v123/img1.jpg",
      "https://res.cloudinary.com/demo/image/upload/v123/img2.jpg",
    ];

    const result = await deleteImagesFromCloudinary(urls);

    expect(result.success).toBe(false);
    expect(result.deleted).toBe(1);
    expect(result.errors).toHaveLength(1);
  });

  it("devuelve success:true con 0 eliminados si el array está vacío", async () => {
    const result = await deleteImagesFromCloudinary([]);

    expect(result.success).toBe(true);
    expect(result.deleted).toBe(0);
    expect(result.errors).toHaveLength(0);
  });
});
