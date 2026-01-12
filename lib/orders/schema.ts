import { z } from "zod";

import { baseAddressSchema } from "@/lib/account/schema";

const phoneRegex = /^[0-9+\s()-]{6,20}$/;
const requiredString = z.string().trim().min(1, "Campo requerido");

// --- Items ---
export const orderItemSchema = z.object({
  productId: z.string().min(1),
  variantId: z.string().min(1),
  quantity: z.number().int().positive().max(100),
  priceCents: z.number().optional(),
});

// --- Base ---
const baseOrderSchema = z.object({
  firstName: requiredString.min(2, "Mínimo 2 letras"),
  lastName: requiredString.min(2, "Mínimo 2 letras"),
  email: z.string().trim().email("Email inválido"),
  phone: z.string().regex(phoneRegex, "Teléfono inválido"),

  paymentMethod: z.enum(["card", "bizum", "transfer", "cash"], {
    message: "Selecciona un método de pago",
  }),

  cartItems: z.array(orderItemSchema).min(1, "El carrito está vacío"),
});

// --- Opciones de Envío ---
const shippingSchema = z.discriminatedUnion("shippingType", [
  // A. DOMICILIO
  z.object({
    shippingType: z.literal("home"),

    firstName: baseAddressSchema.shape.firstName,
    lastName: baseAddressSchema.shape.lastName,
    phone: baseAddressSchema.shape.phone,
    street: baseAddressSchema.shape.street,
    postalCode: baseAddressSchema.shape.postalCode,
    city: baseAddressSchema.shape.city,
    province: baseAddressSchema.shape.province,
    country: baseAddressSchema.shape.country,
    addressExtra: baseAddressSchema.shape.details,
    isDefault: z.boolean().optional(),
    storeLocationId: z.null().optional(),
    pickupLocationId: z.null().optional(),
    pickupSearch: z.null().optional(),
  }),

  // B. TIENDA
  z.object({
    shippingType: z.literal("store"),
    storeLocationId: requiredString,
    street: z.string().optional().nullable(),
    addressExtra: z.string().optional().nullable(),
    postalCode: z.string().optional().nullable(),
    city: z.string().optional().nullable(),
    province: z.string().optional().nullable(),
    country: z.string().optional().nullable(),
    isDefault: z.boolean().optional(),
    pickupLocationId: z.null().optional(),
    pickupSearch: z.null().optional(),
  }),

  // C. PICKUP
  z.object({
    shippingType: z.literal("pickup"),
    pickupLocationId: requiredString,
    pickupSearch: z.string().optional(),
    storeLocationId: z.null().optional(),
    street: z.string().optional().nullable(),
    addressExtra: z.string().optional().nullable(),
    postalCode: z.string().optional().nullable(),
    city: z.string().optional().nullable(),
    province: z.string().optional().nullable(),
    country: z.string().optional().nullable(),
    isDefault: z.boolean().optional(),
  }),
]);

export const createOrderSchema = z.intersection(
  baseOrderSchema,
  shippingSchema,
);
export type CreateOrderInput = z.infer<typeof createOrderSchema>;
