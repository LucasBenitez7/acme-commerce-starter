"use client";

import { zodResolver } from "@hookform/resolvers/zod";
import { useEffect, useState } from "react";
import { useForm, type DefaultValues } from "react-hook-form";

import {
  checkoutSchema,
  defaultCheckoutValues,
  type CheckoutFormValues,
} from "@/lib/validation/checkout";

import type { CheckoutStep } from "@/components/checkout/layout";

const STORAGE_KEY = "checkout.form.v2";

type UseCheckoutFormProps = {
  defaults?: Partial<CheckoutFormValues>;
};

export function useCheckoutForm({ defaults }: UseCheckoutFormProps = {}) {
  const [step, setStep] = useState<CheckoutStep>(1);
  const [isLoaded, setIsLoaded] = useState(false);

  const methods = useForm<CheckoutFormValues>({
    resolver: zodResolver(checkoutSchema),
    defaultValues: {
      ...defaultCheckoutValues,
      ...defaults,
    } as DefaultValues<CheckoutFormValues>,
    mode: "onChange",
  });

  const { watch, reset, trigger } = methods;
  const formValues = watch();

  // 1. CARGA INICIAL (Solo una vez)
  useEffect(() => {
    if (typeof window === "undefined") return;

    const storedForm = window.localStorage.getItem(STORAGE_KEY);
    if (storedForm) {
      try {
        const parsed = JSON.parse(storedForm);
        reset({ ...defaultCheckoutValues, ...defaults, ...parsed });
      } catch (e) {
        console.error("Error recuperando form:", e);
      }
    }

    setIsLoaded(true);
  }, []);

  // 2. PERSISTENCIA (Guarda cambios)
  useEffect(() => {
    if (!isLoaded || typeof window === "undefined") return;

    const { shippingType, paymentMethod, ...persistentValues } = formValues;

    window.localStorage.setItem(STORAGE_KEY, JSON.stringify(persistentValues));
  }, [formValues, isLoaded]);

  // 3. NAVEGACIÓN
  const handleNext = async () => {
    let fieldsToValidate: (keyof CheckoutFormValues)[] = [];

    if (step === 1) {
      fieldsToValidate = [
        "firstName",
        "lastName",
        "email",
        "phone",
        "shippingType",
      ];

      const type = formValues.shippingType;
      if (type === "home")
        fieldsToValidate.push("street", "postalCode", "city", "province");
      else if (type === "store") fieldsToValidate.push("storeLocationId");
      else if (type === "pickup") fieldsToValidate.push("pickupLocationId");
    } else if (step === 2) {
      fieldsToValidate = ["paymentMethod" as keyof CheckoutFormValues];
    }

    const isStepValid = await trigger(
      fieldsToValidate.length > 0 ? fieldsToValidate : undefined,
    );

    if (isStepValid) {
      setStep((prev) => (prev < 3 ? ((prev + 1) as CheckoutStep) : prev));
      window.scrollTo({ top: 0, behavior: "smooth" });
    }
  };

  const handlePrev = () => {
    setStep((prev) => (prev > 1 ? ((prev - 1) as CheckoutStep) : prev));
    window.scrollTo({ top: 0, behavior: "smooth" });
  };

  // 4. LIMPIEZA EXITOSA
  const clearProgress = () => {
    if (typeof window === "undefined") return;
    window.localStorage.removeItem(STORAGE_KEY);
    setStep(1);
  };

  return {
    methods,
    step,
    setStep,
    handleNext,
    handlePrev,
    clearProgress,
    isLoading: !isLoaded,
  };
}
