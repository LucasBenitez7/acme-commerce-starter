import { z } from "zod";

export const phoneRegex = /^[0-9+\s]+$/;
export const postalCodeRegex = /^\d{5}$/;

// 1. Schema BASE
export const baseAddressSchema = z.object({
  firstName: z.string().trim().min(2, "Mínimo 2 letras"),
  lastName: z.string().trim().min(2, "Mínimo 2 letras"),
  phone: z
    .string()
    .trim()
    .min(6, "Teléfono inválido")
    .regex(phoneRegex, "Solo números"),

  street: z.string().trim().min(5, "Dirección muy corta"),

  details: z.string().trim().min(1, "Requerido"),

  postalCode: z
    .string()
    .trim()
    .regex(postalCodeRegex, "CP inválido (5 dígitos)"),
  city: z.string().trim().min(2, "Requerido"),
  province: z.string().trim().min(2, "Requerido"),

  country: z.string().trim().optional(),
});

export const addressFormSchema = baseAddressSchema.extend({
  id: z.string().optional(),
  isDefault: z.boolean().optional(),
});

export type BaseAddressValues = z.infer<typeof baseAddressSchema>;
export type AddressFormValues = z.infer<typeof addressFormSchema>;
