"use client";

import { useEffect } from "react";
import { useFormContext } from "react-hook-form";

import type { CheckoutFormValues } from "@/lib/checkout/schema";
import type { UserAddress } from "@prisma/client";

export function useCheckoutAddress(
  savedAddresses: UserAddress[],
  selectedAddressId: string,
) {
  const { setValue, watch, clearErrors } = useFormContext<CheckoutFormValues>();
  const shippingType = watch("shippingType");

  useEffect(() => {
    if (shippingType !== "home") return;

    const address = savedAddresses.find((a) => a.id === selectedAddressId);

    if (address) {
      const fields = [
        "firstName",
        "lastName",
        "phone",
        "street",
        "details",
        "postalCode",
        "city",
        "province",
        "country",
      ] as const;

      fields.forEach((field) => {
        setValue(field, address[field] || "", {
          shouldValidate: true,
          shouldDirty: true,
        });
      });

      clearErrors();
    }
  }, [selectedAddressId, savedAddresses, shippingType, setValue, clearErrors]);
}
