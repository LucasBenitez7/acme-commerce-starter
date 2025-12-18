import { z } from "zod";

import { addressSchema } from "@/lib/account/schema";

export const cartItemSchema = z.object({
  productId: z.string().min(1),
  variantId: z.string().optional(),
  quantity: z.number().int().positive(),
});

export const checkoutSchema = z.object({
  // ... (otros campos) ...
  email: z.string().email("Email inválido"),

  // Extendemos addressSchema
  firstName: addressSchema.shape.firstName,
  lastName: addressSchema.shape.lastName,
  phone: addressSchema.shape.phone,
  street: addressSchema.shape.street,
  details: addressSchema.shape.details,
  city: addressSchema.shape.city,
  province: addressSchema.shape.province,
  postalCode: addressSchema.shape.postalCode,
  country: addressSchema.shape.country,

  // Shipping
  shippingType: z.enum(["home", "store", "pickup"]).default("home"),
  storeLocationId: z.string().optional().nullable(),
  pickupLocationId: z.string().optional().nullable(),
  pickupSearch: z.string().optional().nullable(),

  paymentMethod: z.enum(["card", "transfer"]).default("card"),
  cartItems: z.array(cartItemSchema).min(1, "El carrito está vacío"),
});

export type CheckoutFormValues = z.infer<typeof checkoutSchema>;
