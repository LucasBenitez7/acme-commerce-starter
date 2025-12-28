import { z } from "zod";

import { baseAddressSchema } from "@/lib/account/schema";
import { SHIPPING_METHODS } from "@/lib/constants";

const shippingIds = SHIPPING_METHODS.map((m) => m.id) as [string, ...string[]];

export const checkoutSchema = baseAddressSchema
  .extend({
    email: z.string().trim().email("Email inválido"),

    shippingType: z.enum(shippingIds),
    paymentMethod: z.enum(["card", "transfer"]),

    storeLocationId: z.string().trim().nullable().optional(),
    pickupLocationId: z.string().trim().nullable().optional(),
    pickupSearch: z.string().trim().nullable().optional(),

    cartItems: z.array(z.any()),
  })
  .superRefine((data, ctx) => {
    if (data.shippingType === "home") {
    }

    if (data.shippingType === "store" && !data.storeLocationId) {
      ctx.addIssue({
        code: "custom",
        message: "Elige una tienda",
        path: ["storeLocationId"],
      });
    }

    if (data.shippingType === "pickup" && !data.pickupLocationId) {
      ctx.addIssue({
        code: "custom",
        message: "Elige un punto",
        path: ["pickupLocationId"],
      });
    }
  });

export type CheckoutFormValues = z.infer<typeof checkoutSchema>;
