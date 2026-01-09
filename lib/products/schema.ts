import { z } from "zod";

export const productVariantSchema = z.object({
  id: z.string().optional(),
  size: z.string().min(1, "Falta Talla"),
  color: z.string().min(1, "Falta Color"),
  colorHex: z.string().optional().nullable(),

  stock: z
    .union([z.coerce.number().int().min(0, "Mínimo 0"), z.nan()])
    .refine((val) => !isNaN(val), {
      message: "Requerido",
    }),

  priceCents: z.coerce.number().optional().nullable(),
});

export const productImageSchema = z.object({
  id: z.string().optional(),
  url: z.string().url().min(1, "URL requerida"),
  alt: z.string().optional().nullable(),
  color: z.string().optional().nullable(),
  sort: z.number().int().default(0),
});

export const productSchema = z
  .object({
    name: z.string().min(3, "Mínimo 3 caracteres"),
    slug: z.string().optional(),
    description: z.string().optional(),
    priceCents: z.coerce.number().min(1, "El precio es requerido"),
    categoryId: z.string().min(1, "Selecciona una categoría"),
    isArchived: z.boolean().default(false),

    images: z.array(productImageSchema).default([]),
    variants: z
      .array(productVariantSchema)
      .min(1, "Debes añadir al menos una variante"),
  })
  .superRefine((data, ctx) => {
    const variantMap = new Map<string, number[]>();

    data.variants.forEach((v, idx) => {
      const uniqueKey = `${v.color.trim().toUpperCase()}-${v.size.trim().toUpperCase()}`;

      if (uniqueKey.length > 1 && v.size && v.color) {
        if (!variantMap.has(uniqueKey)) {
          variantMap.set(uniqueKey, []);
        }
        variantMap.get(uniqueKey)?.push(idx);
      }
    });

    variantMap.forEach((indices, key) => {
      if (indices.length > 1) {
        indices.forEach((idx) => {
          ctx.addIssue({
            code: "custom",
            message: "Duplicado",
            path: ["variants", idx, "size"],
          });
          ctx.addIssue({
            code: "custom",
            message: "Variante repetida",
            path: ["variants", idx, "color"],
          });
        });
      }
    });

    const variantColors = new Set(data.variants.map((v) => v.color));
    const imageColors = new Set(
      data.images.map((img) => img.color).filter((c): c is string => !!c),
    );

    variantColors.forEach((color) => {
      if (color && !imageColors.has(color)) {
        ctx.addIssue({
          code: "custom",
          message: `El color "${color}" no tiene imagen asignada.`,
          path: ["images"],
        });
      }
    });
  });

export type ProductFormValues = z.infer<typeof productSchema>;
export type VariantItem = z.infer<typeof productVariantSchema>;
export type ImageItem = z.infer<typeof productImageSchema>;
