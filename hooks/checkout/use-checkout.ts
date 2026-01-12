"use client";

import { useRouter } from "next/navigation";
import { useState, useEffect } from "react";
import { useFormContext, type FieldErrors } from "react-hook-form";
import { toast } from "sonner";

import { createOrderAction } from "@/app/(site)/(shop)/checkout/actions";
import { useCartStore } from "@/store/cart";

import type { CreateOrderInput } from "@/lib/orders/schema";
import type { UserAddress } from "@prisma/client";

export function useCheckout(savedAddresses: UserAddress[]) {
  const router = useRouter();
  const { items, clearCart } = useCartStore();

  const { handleSubmit, setValue, watch } = useFormContext<CreateOrderInput>();

  const shippingType = watch("shippingType");

  const [selectedAddressId, setSelectedAddressId] = useState<string>(() => {
    const def = savedAddresses.find((a) => a.isDefault);
    return def ? def.id : savedAddresses[0]?.id || "";
  });

  const [isAddressConfirmed, setIsAddressConfirmed] = useState(false);
  const [isPending, setIsPending] = useState(false);

  useEffect(() => {
    const formItems = items.map((item) => ({
      productId: item.productId,
      variantId: item.variantId,
      quantity: item.quantity,
      priceCents: Math.round(item.price * 100),
    }));

    setValue("cartItems", formItems);

    // (Opcional) Si hubiera error previo, forzamos revalidación
    if (items.length > 0) {
      // trigger("cartItems");
    }
  }, [items, setValue]);

  useEffect(() => {
    if (shippingType === "home" && selectedAddressId) {
      const addr = savedAddresses.find((a) => a.id === selectedAddressId);
      if (addr) {
        setValue("firstName", addr.firstName);
        setValue("lastName", addr.lastName);
        setValue("phone", addr.phone || "");
        setValue("street", addr.street);
        setValue("addressExtra", addr.details || "");
        setValue("postalCode", addr.postalCode);
        setValue("city", addr.city);
        setValue("province", addr.province);
        setValue("country", addr.country);
      }
    }
  }, [selectedAddressId, shippingType, savedAddresses, setValue]);

  // Handler de Éxito
  const onValidSubmit = async (data: CreateOrderInput) => {
    if (data.cartItems.length === 0) {
      toast.error("Tu carrito parece vacío");
      return;
    }

    if (data.shippingType === "home" && !isAddressConfirmed) {
      toast.error("Por favor, confirma tu dirección de envío.");
      const element = document.getElementById("checkout-main-form");
      element?.scrollIntoView({ behavior: "smooth" });
      return;
    }

    setIsPending(true);

    try {
      const formData = new FormData();
      Object.entries(data).forEach(([key, val]) => {
        if (key !== "cartItems" && val !== null && val !== undefined) {
          formData.append(key, String(val));
        }
      });

      formData.append("cartItems", JSON.stringify(data.cartItems));

      const res = await createOrderAction({ error: undefined }, formData);

      if (res?.error) {
        toast.error(res.error);
      } else if (res?.success && res?.orderId) {
        toast.success("¡Pedido creado!");
        router.push(`/checkout/success?orderId=${res.orderId}`);
      }
    } catch (err) {
      console.error(err);
      toast.error("Error inesperado al procesar el pedido.");
    } finally {
      setIsPending(false);
    }
  };

  const onInvalidSubmit = (errors: FieldErrors<CreateOrderInput>) => {
    console.log("Errores de validación:", errors);

    if (errors.cartItems) {
      toast.error("Error: El carrito está vacío en el formulario.");
    } else {
      toast.error("Faltan campos por rellenar.");
    }

    if (errors.shippingType) toast.error("Selecciona un método de envío.");
    else if (errors.paymentMethod) toast.error("Selecciona un método de pago.");
    else if (errors.firstName || errors.street)
      toast.error("Revisa la dirección.");
  };

  return {
    isPending,
    selectedAddressId,
    setSelectedAddressId,
    isAddressConfirmed,
    setIsAddressConfirmed,
    onCheckoutSubmit: handleSubmit(onValidSubmit, onInvalidSubmit),
  };
}
