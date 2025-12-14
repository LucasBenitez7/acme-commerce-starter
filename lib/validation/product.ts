import { z } from "zod";

// --- Sub-esquemas ---
export const productVariantSchema = z.object({
  id: z.string().optional(),
  size: z.string().min(1, "La talla es obligatoria"),
  color: z.string().min(1, "El color es obligatorio"),
  colorHex: z.string().optional().nullable(),
  stock: z.coerce.number().min(0, "Stock inválido").default(0),
});

export const productImageSchema = z.object({
  id: z.string().optional(),
  url: z.string().url("URL inválida").min(1, "URL requerida"),
  alt: z.string().optional(),
  color: z.string().optional().nullable(),
  sort: z.number().int().default(0),
});

// --- Esquema Principal ---
export const productSchema = z.object({
  name: z.string().min(3, "Mínimo 3 caracteres"),
  slug: z.string().optional(),
  description: z.string().optional(), // Zod lo hace opcional | undefined
  priceCents: z.coerce.number().min(1, "El precio debe ser mayor a 0"),
  categoryId: z.string().min(1, "Selecciona una categoría"),
  isArchived: z.boolean().default(false),

  images: z.array(productImageSchema).default([]),
  variants: z.array(productVariantSchema).min(1, "Añade al menos una variante"),
});

// --- Tipos Inferidos ---
export type ProductFormValues = z.infer<typeof productSchema>;
export type VariantItem = z.infer<typeof productVariantSchema>;
export type ImageItem = z.infer<typeof productImageSchema>;
