import { z } from "zod";

// --- 1. Validaciones Básicas (Regex) ---
const phoneRegex = /^[0-9+\s()-]{6,20}$/;
const postalCodeEsRegex = /^(?:0[1-9]|[1-4]\d|5[0-2])\d{3}$/;

// --- 2. Validación de Items del Carrito ---
export const orderItemSchema = z.object({
  productId: z.string().min(1, "Product ID is required"),
  variantId: z.string().min(1, "Variant ID is required"),
  quantity: z
    .number()
    .int()
    .positive("La cantidad debe ser al menos 1")
    .max(100, "No puedes pedir más de 100 unidades del mismo artículo"),
});

// --- 3. Datos del Usuario ---
const userDetailsSchema = z.object({
  firstName: z.string().min(2, "Mínimo 2 caracteres"),
  lastName: z.string().min(2, "Mínimo 2 caracteres"),
  email: z.string().email("Email inválido"),
  phone: z.string().regex(phoneRegex, "Teléfono inválido"),
  paymentMethod: z.enum(["card", "bizum", "transfer", "cash"], {
    message: "Selecciona un método de pago válido",
  }),
});

// --- 4. Lógica de Envío (Unión Discriminada) ---
const shippingSchema = z.discriminatedUnion("shippingType", [
  z.object({
    shippingType: z.literal("home"),

    street: z.string().min(5, "Dirección muy corta"),
    addressExtra: z.string().optional(),
    postalCode: z.string().regex(postalCodeEsRegex, "CP inválido"),
    city: z.string().min(2, "Ciudad requerida"),
    province: z.string().min(2, "Provincia requerida"),
    country: z.string().default("ES"),

    storeLocationId: z.string().optional().nullable(),
    pickupLocationId: z.string().optional().nullable(),
  }),

  z.object({
    shippingType: z.literal("store"),
    storeLocationId: z.string().min(1, "Selecciona una tienda"),

    street: z.string().optional().nullable(),
    addressExtra: z.string().optional().nullable(),
    postalCode: z.string().optional().nullable(),
    city: z.string().optional().nullable(),
    province: z.string().optional().nullable(),
    country: z.string().optional().nullable(),
    pickupLocationId: z.string().optional().nullable(),
  }),

  z.object({
    shippingType: z.literal("pickup"),
    pickupLocationId: z.string().min(1, "Selecciona un punto"),

    storeLocationId: z.string().optional().nullable(),
    street: z.string().optional().nullable(),
    addressExtra: z.string().optional().nullable(),
    postalCode: z.string().optional().nullable(),
    city: z.string().optional().nullable(),
    province: z.string().optional().nullable(),
    country: z.string().optional().nullable(),
  }),
]);

// --- 5. ESQUEMA MAESTRO ---
export const createOrderSchema = z
  .intersection(userDetailsSchema, shippingSchema)
  .and(
    z.object({
      items: z.array(orderItemSchema).min(1, "Tu carrito está vacío"),
    }),
  );

// --- 6. Tipos Inferidos ---
export type CreateOrderInput = z.infer<typeof createOrderSchema>;
export type OrderItemInput = z.infer<typeof orderItemSchema>;
export type ShippingTypeInput = CreateOrderInput["shippingType"];
