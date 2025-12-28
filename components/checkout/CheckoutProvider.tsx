"use client";

import { zodResolver } from "@hookform/resolvers/zod";
import { type ReactNode, useMemo } from "react";
import { FormProvider, useForm } from "react-hook-form";

import { checkoutSchema, type CheckoutFormValues } from "@/lib/checkout/schema";

type Props = {
  children: ReactNode;
  defaultValues?: Partial<CheckoutFormValues>;
};

export function CheckoutProvider({ children, defaultValues }: Props) {
  const initialValues: CheckoutFormValues = useMemo(() => {
    return {
      email: defaultValues?.email ?? "",
      firstName: defaultValues?.firstName ?? "",
      lastName: defaultValues?.lastName ?? "",
      phone: defaultValues?.phone ?? "",

      street: defaultValues?.street ?? "",
      city: defaultValues?.city ?? "",
      province: defaultValues?.province ?? "",
      postalCode: defaultValues?.postalCode ?? "",

      details: defaultValues?.details ?? "",
      country: defaultValues?.country ?? "España",

      shippingType: defaultValues?.shippingType ?? "home",
      paymentMethod: defaultValues?.paymentMethod ?? "card",

      storeLocationId: defaultValues?.storeLocationId ?? null,
      pickupLocationId: defaultValues?.pickupLocationId ?? null,
      pickupSearch: defaultValues?.pickupSearch ?? null,

      cartItems: defaultValues?.cartItems ?? [],
    };
  }, [defaultValues]);

  const methods = useForm<CheckoutFormValues>({
    resolver: zodResolver(checkoutSchema),
    defaultValues: initialValues,
    mode: "onChange",
  });

  return <FormProvider {...methods}>{children}</FormProvider>;
}
