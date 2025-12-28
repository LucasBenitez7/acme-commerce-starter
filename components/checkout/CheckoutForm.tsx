"use client";

import { type UserAddress } from "@prisma/client";
import { useRouter } from "next/navigation";
import { useState } from "react";
import { useFormContext } from "react-hook-form";
import { toast } from "sonner";

import { type CheckoutFormValues } from "@/lib/checkout/schema";

import { createOrderAction } from "@/app/(site)/(shop)/checkout/actions";
import { useCheckoutAddress } from "@/hooks/checkout/use-checkout-address";
import { useCartStore } from "@/store/cart";

import { PaymentSection } from "./sections/PaymentSection";
import { ShippingSection } from "./sections/ShippingSection";

type Props = {
  savedAddresses?: UserAddress[];
};

export function CheckoutForm({ savedAddresses = [] }: Props) {
  const router = useRouter();
  const { items } = useCartStore();

  const { handleSubmit, watch } = useFormContext<CheckoutFormValues>();

  const [selectedAddressId, setSelectedAddressId] = useState<string>(() => {
    if (savedAddresses.length > 0) {
      const def = savedAddresses.find((a) => a.isDefault);
      return def ? def.id : savedAddresses[0].id;
    }
    return "";
  });

  const [isAddressConfirmed, setIsAddressConfirmed] = useState(false);

  useCheckoutAddress(savedAddresses, selectedAddressId);

  const onError = (errors: any) => {
    if (errors.shippingType) {
      toast.error("Por favor, selecciona un método de entrega");
    }
  };

  const onSubmit = async (data: CheckoutFormValues) => {
    if (items.length === 0) {
      toast.error("Carrito vacío");
      router.push("/catalogo");
      return;
    }

    if (data.shippingType === "home") {
      if (!selectedAddressId) {
        toast.error("Selecciona o crea una dirección de entrega");
        return;
      }
      if (!isAddressConfirmed) {
        toast.error("Confirma tu dirección de envío");
        return;
      }
    }

    try {
      const formData = new FormData();
      Object.entries(data).forEach(([key, val]) => {
        if (val !== null && val !== undefined && key !== "cartItems") {
          formData.append(key, String(val));
        }
      });

      const cartPayload = items.map((item) => ({
        productId: item.productId,
        variantId: item.variantId,
        quantity: item.quantity,
      }));
      formData.append("cartItems", JSON.stringify(cartPayload));

      const res = await createOrderAction({ error: undefined }, formData);

      if (res?.error) {
        toast.error(res.error);
      } else if (res?.success && res?.orderId) {
        toast.success("Pedido procesado correctamente");
        router.push(`/checkout/success?orderId=${res.orderId}`);

        await new Promise(() => {});
      }
    } catch (err) {
      console.error(err);
      toast.error("Error de conexión al procesar el pedido.");
    }
  };

  return (
    <form
      id="checkout-main-form"
      onSubmit={handleSubmit(onSubmit, onError)}
      className="space-y-6"
    >
      <ShippingSection
        savedAddresses={savedAddresses}
        selectedAddressId={selectedAddressId}
        setSelectedAddressId={setSelectedAddressId}
        isAddressConfirmed={isAddressConfirmed}
        onConfirmAddress={() => setIsAddressConfirmed(true)}
        onChangeAddress={() => setIsAddressConfirmed(false)}
      />

      <PaymentSection isOpen={isAddressConfirmed} />
    </form>
  );
}
