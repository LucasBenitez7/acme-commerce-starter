"use client";

import { useRouter } from "next/navigation";
import { useState, useEffect, useRef } from "react";
import { useFormContext } from "react-hook-form";
import { toast } from "sonner";

import { createOrderAction } from "@/app/(site)/(shop)/checkout/actions";
import { useCartStore } from "@/store/cart";

import type { CreateOrderInput } from "@/lib/orders/schema";
import type { UserAddress } from "@prisma/client";

export function useCheckout(savedAddresses: UserAddress[]) {
  const router = useRouter();
  const { items } = useCartStore();

  const { handleSubmit, setValue, watch, trigger, getValues } =
    useFormContext<CreateOrderInput>();

  const shippingType = watch("shippingType");

  const [selectedAddressId, setSelectedAddressId] = useState<string>(() => {
    const def = savedAddresses.find((a) => a.isDefault);
    return def ? def.id : "";
  });

  const [isAddressConfirmed, setIsAddressConfirmed] = useState(() => {
    return savedAddresses.some((a) => a.isDefault);
  });
  const [isPending, setIsPending] = useState(false);

  const [stripeData, setStripeData] = useState<{
    clientSecret: string;
    orderId: string;
  } | null>(null);

  useEffect(() => {
    const savedSession = localStorage.getItem("checkout_session");
    if (savedSession) {
      try {
        const parsed = JSON.parse(savedSession);
        const now = new Date().getTime();
        if (now - parsed.timestamp < 3600000) {
        } else {
          localStorage.removeItem("checkout_session");
        }
      } catch (e) {
        localStorage.removeItem("checkout_session");
      }
    }
  }, []);

  useEffect(() => {
    const formItems = items.map((item) => ({
      productId: item.productId,
      variantId: item.variantId,
      quantity: item.quantity,
      priceCents: Math.round(item.price * 100),
    }));
    setValue("cartItems", formItems);
  }, [items, setValue]);

  useEffect(() => {
    if (shippingType === "home" && selectedAddressId) {
      const addr = savedAddresses.find((a) => a.id === selectedAddressId);
      if (addr) {
        setValue("firstName", addr.firstName);
        setValue("lastName", addr.lastName);
        setValue("phone", addr.phone || "");
        setValue("street", addr.street);
        setValue("details", addr.details || "");
        setValue("postalCode", addr.postalCode);
        setValue("city", addr.city);
        setValue("province", addr.province);
        setValue("country", addr.country);
      }
    }
  }, [selectedAddressId, shippingType, savedAddresses, setValue]);

  const handleConfirmAddress = async () => {
    let isValid = false;

    if (shippingType === "home") {
      isValid = await trigger([
        "firstName",
        "lastName",
        "street",
        "city",
        "province",
        "postalCode",
        "phone",
      ]);
    } else {
      isValid = await trigger(["storeLocationId", "pickupLocationId"]);
    }

    if (!isValid) {
      toast.error("Por favor, completa los datos de envío obligatorios.");
      return;
    }

    setIsPending(true);

    const currentData = getValues();
    currentData.paymentMethod = "card";

    const formData = new FormData();
    Object.entries(currentData).forEach(([key, val]) => {
      if (key !== "cartItems" && val !== null && val !== undefined) {
        formData.append(key, String(val));
      }
    });
    formData.append("cartItems", JSON.stringify(currentData.cartItems));

    let orderIdToRecycle = stripeData?.orderId;

    if (!orderIdToRecycle) {
      const savedSession = localStorage.getItem("checkout_session");
      if (savedSession) {
        try {
          const parsed = JSON.parse(savedSession);
          if (items.length > 0) {
            orderIdToRecycle = parsed.orderId;
          }
        } catch (e) {}
      }
    }

    if (orderIdToRecycle) {
      formData.append("existingOrderId", orderIdToRecycle);
    }

    try {
      const res = await createOrderAction({ error: undefined }, formData);

      if (res?.error) {
        localStorage.removeItem("checkout_session");
        toast.error(res.error);
        setIsPending(false);
        return;
      }

      if (res?.success && res.isStripe && res.clientSecret && res.orderId) {
        setStripeData({
          clientSecret: res.clientSecret,
          orderId: res.orderId,
        });

        localStorage.setItem(
          "checkout_session",
          JSON.stringify({
            orderId: res.orderId,
            timestamp: new Date().getTime(),
          }),
        );

        setIsAddressConfirmed(true);
      }
    } catch (error) {
      console.error(error);
      toast.error("Error al iniciar el pago.");
    } finally {
      setIsPending(false);
    }
  };

  const handleChangeAddress = () => {
    setIsAddressConfirmed(false);
  };

  const autoConfirmAttempted = useRef(false);

  useEffect(() => {
    if (
      !autoConfirmAttempted.current &&
      savedAddresses?.some((a) => a.isDefault)
    ) {
      autoConfirmAttempted.current = true;
      handleConfirmAddress();
    }
  }, [savedAddresses]);

  const onValidSubmit = async (data: CreateOrderInput) => {};

  return {
    isPending,
    selectedAddressId,
    setSelectedAddressId,
    isAddressConfirmed,
    onConfirmAddress: handleConfirmAddress,
    onChangeAddress: handleChangeAddress,
    onCheckoutSubmit: handleSubmit(onValidSubmit),
    stripeData,
  };
}
