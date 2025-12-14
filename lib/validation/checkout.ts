import { z } from "zod";

// Validaciones básicas
const phoneRegex = /^[0-9+\s()-]{6,20}$/;
const postalCodeEsRegex = /^(?:0[1-9]|[1-4]\d|5[0-2])\d{3}$/;

const baseSchema = z.object({
  firstName: z.string().min(2, "Mínimo 2 caracteres"),
  lastName: z.string().min(2, "Mínimo 2 caracteres"),
  email: z.string().email("Email inválido"),
  phone: z.string().regex(phoneRegex, "Teléfono inválido"),
  paymentMethod: z.enum(["card", "bizum", "transfer", "cash"]),

  storeSearch: z.string().optional(),
  pickupSearch: z.string().optional(),
});

// 2. Unión Discriminada para el Envío
const shippingSchema = z.discriminatedUnion("shippingType", [
  // CASO A: Domicilio
  z.object({
    shippingType: z.literal("home"),
    street: z.string().min(5, "Dirección muy corta"),
    addressExtra: z.string().optional(),
    postalCode: z.string().regex(postalCodeEsRegex, "CP inválido"),
    province: z.string().min(2, "Provincia requerida"),
    city: z.string().min(2, "Ciudad requerida"),
    storeLocationId: z.string().optional().nullable(),
    pickupLocationId: z.string().optional().nullable(),
  }),
  // CASO B: Tienda
  z.object({
    shippingType: z.literal("store"),
    storeLocationId: z.string().min(1, "Selecciona una tienda"),
    street: z.string().optional().nullable(),
    addressExtra: z.string().optional().nullable(),
    postalCode: z.string().optional().nullable(),
    province: z.string().optional().nullable(),
    city: z.string().optional().nullable(),
    pickupLocationId: z.string().optional().nullable(),
  }),
  // CASO C: Pickup
  z.object({
    shippingType: z.literal("pickup"),
    pickupLocationId: z.string().min(1, "Selecciona un punto"),
    street: z.string().optional().nullable(),
    addressExtra: z.string().optional().nullable(),
    postalCode: z.string().optional().nullable(),
    province: z.string().optional().nullable(),
    city: z.string().optional().nullable(),
    storeLocationId: z.string().optional().nullable(),
  }),
]);

// 3. Esquema Final
export const checkoutSchema = z.intersection(baseSchema, shippingSchema);

// 4. Tipos Inferidos
export type CheckoutFormValues = z.infer<typeof checkoutSchema>;

// Exportamos ShippingType explícitamente para usarlo en otros lados
export type ShippingType = CheckoutFormValues["shippingType"];

// 5. Valores por defecto (Seguros)
export const defaultCheckoutValues: Partial<CheckoutFormValues> = {
  shippingType: "home",
  paymentMethod: "card",
  firstName: "",
  lastName: "",
  email: "",
  phone: "",
  street: "",
  addressExtra: "",
  postalCode: "",
  province: "",
  city: "",
  storeSearch: "",
  pickupSearch: "",
};
