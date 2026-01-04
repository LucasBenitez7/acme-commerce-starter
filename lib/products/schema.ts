import { z } from "zod";

// --- Sub-esquemas ---
export const productVariantSchema = z.object({
  id: z.string().optional(),
  size: z.string().min(1, "La talla es obligatoria"),
  color: z.string().min(1, "El color es obligatorio"),
  colorHex: z.string().optional().nullable(),
  priceCents: z.coerce.number().min(0).optional().nullable(),
  stock: z.coerce.number().min(0, "Stock inválido").default(0),
  // isActive: z.boolean().default(true)
});

export const productImageSchema = z.object({
  id: z.string().optional(),
  url: z.string().url("URL inválida").min(1, "URL requerida"),
  alt: z.string().optional().nullable(),
  color: z.string().optional().nullable(),
  sort: z.number().int().default(0),
});

// --- Esquema Principal ---
export const productSchema = z
  .object({
    name: z.string().min(3, "Mínimo 3 caracteres"),
    slug: z.string().optional(),
    description: z.string().optional(),
    priceCents: z.coerce.number().min(1, "El precio debe ser mayor a 0"),
    categoryId: z.string().min(1, "Selecciona una categoría"),
    isArchived: z.boolean().default(false),

    images: z.array(productImageSchema).default([]),
    variants: z
      .array(productVariantSchema)
      .min(1, "Añade al menos una variante"),
  })
  .superRefine((data, ctx) => {
    const variantColors = new Set(data.variants.map((v) => v.color));

    const imageColors = new Set(
      data.images.map((img) => img.color).filter((c): c is string => !!c),
    );

    // VALIDACIÓN A: ¿Hay algún color de variante que no tenga imagen?
    variantColors.forEach((color) => {
      if (color && !imageColors.has(color)) {
        ctx.addIssue({
          code: "custom",
          message: `El color "${color}" tiene variantes pero no tiene ninguna imagen asignada.`,
          path: ["images"],
        });
      }
    });

    // VALIDACIÓN B: Imágenes duplicadas (Misma URL usada 2 veces)
    const urls = data.images.map((i) => i.url);
    const uniqueUrls = new Set(urls);
    if (urls.length !== uniqueUrls.size) {
      ctx.addIssue({
        code: "custom",
        message:
          "Hay imágenes duplicadas. No puedes usar la misma foto dos veces.",
        path: ["images"],
      });
    }
  });

// --- Tipos Inferidos ---
export type ProductFormValues = z.infer<typeof productSchema>;
export type VariantItem = z.infer<typeof productVariantSchema>;
export type ImageItem = z.infer<typeof productImageSchema>;
