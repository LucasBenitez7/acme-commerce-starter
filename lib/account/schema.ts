import { z } from "zod";

export const addressSchema = z.object({
  id: z.string().optional(),
  name: z.string().optional().or(z.literal("")),
  firstName: z.string().min(2, "Mínimo 2 letras"),
  lastName: z.string().min(2, "Mínimo 2 letras"),
  phone: z.string().min(6, "Teléfono inválido"),
  street: z.string().min(5, "Dirección muy corta"),
  details: z.string().optional().or(z.literal("")),
  postalCode: z.string().min(3, "Requerido"),
  city: z.string().min(2, "Requerido"),
  province: z.string().min(2, "Requerido"),
  country: z.string().default("ES"),
  isDefault: z.boolean().default(false),
});

export type AddressFormValues = z.infer<typeof addressSchema>;
