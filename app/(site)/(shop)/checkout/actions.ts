"use server";

import { auth } from "@/lib/auth";
import { createOrderSchema } from "@/lib/orders/schema";
import { createOrder } from "@/lib/orders/service";

export type CheckoutActionState = {
  error?: string;
  success?: boolean;
  orderId?: string;
};

export async function createOrderAction(
  prevState: CheckoutActionState,
  formData: FormData,
): Promise<CheckoutActionState> {
  const session = await auth();

  const rawData: Record<string, any> = {};

  formData.forEach((value, key) => {
    if (key === "cartItems") {
      try {
        rawData[key] = JSON.parse(value as string);
      } catch {
        rawData[key] = [];
      }
    } else {
      if (value === "true") rawData[key] = true;
      else if (value === "false") rawData[key] = false;
      else if (value === "") rawData[key] = null;
      else {
        rawData[key] = typeof value === "string" ? value.trim() : value;
      }
    }
  });

  if (!rawData.shippingType) rawData.shippingType = "home";

  const validation = createOrderSchema.safeParse(rawData);

  if (!validation.success) {
    return { error: validation.error.issues[0].message };
  }

  try {
    const order = await createOrder(validation.data, session?.user?.id);

    if (order?.id) {
      return { success: true, orderId: order.id };
    }
  } catch (error: any) {
    console.error("Checkout Error:", error);
    return { error: error.message || "Error al procesar el pedido." };
  }

  return { error: "Error desconocido." };
}
