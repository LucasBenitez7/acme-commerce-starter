"use client";

import { useEffect, useState } from "react";

import {
  isValidEmail,
  isNonEmptyMin,
  isValidPhone,
} from "@/lib/validation/checkout";

import type { CheckoutStep } from "@/components/checkout";

export type PaymentMethod = "card";

export type CheckoutFormState = {
  fullName: string;
  email: string;
  address: string;
  city: string;
  phone: string;
  paymentMethod: PaymentMethod;
};

export type CheckoutClientErrors = {
  fullName: boolean;
  email: boolean;
  address: boolean;
  city: boolean;
  phone: boolean;
};

const STORAGE_KEY = "checkout.form.v1";

const INITIAL_FORM_STATE: CheckoutFormState = {
  fullName: "",
  email: "",
  address: "",
  city: "",
  phone: "",
  paymentMethod: "card",
};

export function useCheckoutForm() {
  const [form, setForm] = useState<CheckoutFormState>(INITIAL_FORM_STATE);
  const [isValid, setIsValid] = useState(false);
  const [step, setStep] = useState<CheckoutStep>(1);
  const [maxStepReached, setMaxStepReached] = useState<CheckoutStep>(1);

  // Restaura desde localStorage
  useEffect(() => {
    if (typeof window === "undefined") return;

    try {
      const raw = window.localStorage.getItem(STORAGE_KEY);
      if (!raw) return;

      const parsed = JSON.parse(raw) as Partial<CheckoutFormState>;

      setForm((prev) => ({
        ...prev,
        fullName:
          typeof parsed.fullName === "string" ? parsed.fullName : prev.fullName,
        email: typeof parsed.email === "string" ? parsed.email : prev.email,
        address:
          typeof parsed.address === "string" ? parsed.address : prev.address,
        city: typeof parsed.city === "string" ? parsed.city : prev.city,
        phone: typeof parsed.phone === "string" ? parsed.phone : prev.phone,
        paymentMethod:
          parsed.paymentMethod === "card"
            ? parsed.paymentMethod
            : prev.paymentMethod,
      }));
    } catch {
      // ignoramos errores de parseo
    }
  }, []);

  // Guardar en localStorage cuando cambie el form
  useEffect(() => {
    if (typeof window === "undefined") return;

    try {
      window.localStorage.setItem(STORAGE_KEY, JSON.stringify(form));
    } catch {
      // ignoramos errores de almacenamiento
    }
  }, [form]);

  // Validación en cliente para el paso 1 (datos de envío)
  useEffect(() => {
    const valid =
      isNonEmptyMin(form.fullName, 3) &&
      isValidEmail(form.email) &&
      isNonEmptyMin(form.address, 5) &&
      isNonEmptyMin(form.city, 2) &&
      isValidPhone(form.phone);

    setIsValid(valid);
  }, [form]);

  // Errores por campo (solo se muestran si el campo no está vacío)
  const errors: CheckoutClientErrors = {
    fullName: form.fullName !== "" && !isNonEmptyMin(form.fullName, 3),
    email: form.email !== "" && !isValidEmail(form.email),
    address: form.address !== "" && !isNonEmptyMin(form.address, 5),
    city: form.city !== "" && !isNonEmptyMin(form.city, 2),
    phone: form.phone !== "" && !isValidPhone(form.phone),
  };

  function handleChange<K extends keyof CheckoutFormState>(
    key: K,
    value: CheckoutFormState[K],
  ) {
    setForm((prev) => ({
      ...prev,
      [key]: value,
    }));
  }

  function handleNext() {
    setStep((current) => {
      // no avanzamos desde el paso 1 si los datos no son válidos
      if (current === 1 && !isValid) return current;

      const next = (current + 1) as CheckoutStep;

      setMaxStepReached((prevMax) => (next > prevMax ? next : prevMax));

      return next;
    });
  }

  function handlePrev() {
    setStep((current) => {
      if (current === 1) return current;
      return (current - 1) as CheckoutStep;
    });
  }

  function handleStepperClick(target: CheckoutStep) {
    setStep((current) => {
      if (target > maxStepReached) return current;
      return target;
    });
  }

  function resetForm() {
    setForm(INITIAL_FORM_STATE);
    setStep(1);
    setMaxStepReached(1);
  }

  return {
    form,
    isValid,
    step,
    maxStepReached,
    errors,
    handleChange,
    handleNext,
    handlePrev,
    handleStepperClick,
    resetForm,
  };
}
