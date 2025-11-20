"use client";

import { useEffect, useState } from "react";

import {
  isPaymentMethod,
  type PaymentMethod,
} from "@/components/checkout/payment/methods";

import {
  isValidEmail,
  isNonEmptyMin,
  isValidPhone,
  isValidPostalCodeES,
} from "@/lib/validation/checkout";

import type { CheckoutStep } from "@/components/checkout";

export type ShippingType = "home" | "store" | "pickup";

export type CheckoutFormState = {
  firstName: string;
  lastName: string;
  email: string;
  phone: string;
  street: string;
  addressExtra: string;
  postalCode: string;
  province: string;
  city: string;
  shippingType: ShippingType;
  storeLocationId: string;
  pickupLocationId: string;
  pickupSearch: string;
  storeSearch: string;
  paymentMethod: PaymentMethod;
};

export type CheckoutClientErrors = {
  firstName: boolean;
  lastName: boolean;
  email: boolean;
  phone: boolean;
  street: boolean;
  postalCode: boolean;
  province: boolean;
  city: boolean;
  storeLocation: boolean;
  pickupLocation: boolean;
  pickupSearch: boolean;
};

const STORAGE_KEY = "checkout.form.v1";

const INITIAL_FORM_STATE: CheckoutFormState = {
  firstName: "",
  lastName: "",
  email: "",
  phone: "",
  street: "",
  addressExtra: "",
  postalCode: "",
  province: "",
  city: "",
  shippingType: "home",
  storeLocationId: "",
  pickupLocationId: "",
  pickupSearch: "",
  storeSearch: "",
  paymentMethod: "card",
};

export function useCheckoutForm() {
  const [form, setForm] = useState<CheckoutFormState>(INITIAL_FORM_STATE);
  const [isValid, setIsValid] = useState(false);
  const [step, setStep] = useState<CheckoutStep>(1);

  // Ha intentado continuar (al menos una vez)
  const [showAllErrors, setShowAllErrors] = useState(false);

  // Con qué tipo de envío falló el "Continuar"
  const [invalidShippingType, setInvalidShippingType] =
    useState<ShippingType | null>(null);

  // ------------------------
  // Restaurar desde localStorage
  // ------------------------
  useEffect(() => {
    if (typeof window === "undefined") return;

    try {
      const raw = window.localStorage.getItem(STORAGE_KEY);
      if (!raw) return;

      const parsed = JSON.parse(raw) as Partial<CheckoutFormState>;

      setForm((prev) => ({
        ...prev,
        firstName:
          typeof parsed.firstName === "string"
            ? parsed.firstName
            : prev.firstName,
        lastName:
          typeof parsed.lastName === "string" ? parsed.lastName : prev.lastName,
        email: typeof parsed.email === "string" ? parsed.email : prev.email,
        phone: typeof parsed.phone === "string" ? parsed.phone : prev.phone,
        street: typeof parsed.street === "string" ? parsed.street : prev.street,
        addressExtra:
          typeof parsed.addressExtra === "string"
            ? parsed.addressExtra
            : prev.addressExtra,
        postalCode:
          typeof parsed.postalCode === "string"
            ? parsed.postalCode
            : prev.postalCode,
        province:
          typeof parsed.province === "string" ? parsed.province : prev.province,
        city: typeof parsed.city === "string" ? parsed.city : prev.city,
        shippingType:
          parsed.shippingType === "store" ||
          parsed.shippingType === "pickup" ||
          parsed.shippingType === "home"
            ? parsed.shippingType
            : prev.shippingType,
        storeLocationId:
          typeof (parsed as any).storeLocationId === "string"
            ? (parsed as any).storeLocationId
            : prev.storeLocationId,
        pickupLocationId:
          typeof (parsed as any).pickupLocationId === "string"
            ? (parsed as any).pickupLocationId
            : prev.pickupLocationId,
        pickupSearch:
          typeof parsed.pickupSearch === "string"
            ? parsed.pickupSearch
            : prev.pickupSearch,
        storeSearch:
          typeof parsed.storeSearch === "string"
            ? parsed.storeSearch
            : prev.storeSearch,
        paymentMethod: isPaymentMethod(parsed.paymentMethod)
          ? parsed.paymentMethod
          : prev.paymentMethod,
      }));
    } catch {
      // ignoramos errores de parseo
    }
  }, []);

  // ------------------------
  // Guardar en localStorage
  // ------------------------
  useEffect(() => {
    if (typeof window === "undefined") return;

    try {
      window.localStorage.setItem(STORAGE_KEY, JSON.stringify(form));
    } catch {
      // ignoramos errores de almacenamiento
    }
  }, [form]);

  // ------------------------
  // Validación global (isValid)
  // ------------------------
  useEffect(() => {
    const baseValid =
      isNonEmptyMin(form.firstName, 2) &&
      isNonEmptyMin(form.lastName, 2) &&
      isValidEmail(form.email) &&
      isValidPhone(form.phone);

    let extraValid = false;

    if (form.shippingType === "home") {
      extraValid =
        isNonEmptyMin(form.street, 5) &&
        isValidPostalCodeES(form.postalCode) &&
        isNonEmptyMin(form.province, 2) &&
        isNonEmptyMin(form.city, 2);
    } else if (form.shippingType === "store") {
      extraValid = !!form.storeLocationId;
    } else if (form.shippingType === "pickup") {
      extraValid = !!form.pickupLocationId;
    }

    setIsValid(baseValid && extraValid);
  }, [form]);

  // ¿Debemos forzar errores para el tipo actual?
  const forceShowForCurrentShipping =
    showAllErrors &&
    invalidShippingType !== null &&
    invalidShippingType === form.shippingType;

  // ------------------------
  // Errores de contacto (compartidos)
  // ------------------------
  const firstNameError =
    (forceShowForCurrentShipping || form.firstName !== "") &&
    !isNonEmptyMin(form.firstName, 2);

  const lastNameError =
    (forceShowForCurrentShipping || form.lastName !== "") &&
    !isNonEmptyMin(form.lastName, 2);

  const emailError =
    (forceShowForCurrentShipping || form.email !== "") &&
    !isValidEmail(form.email);

  const phoneError =
    (forceShowForCurrentShipping || form.phone !== "") &&
    !isValidPhone(form.phone);

  // ------------------------
  // Errores específicos de envío
  // ------------------------
  let streetError = false;
  let postalCodeError = false;
  let provinceError = false;
  let cityError = false;
  let storeLocationError = false;
  let pickupLocationError = false;
  let pickupSearchError = false;

  if (form.shippingType === "home" && forceShowForCurrentShipping) {
    streetError =
      (forceShowForCurrentShipping || form.street !== "") &&
      !isNonEmptyMin(form.street, 5);

    postalCodeError =
      (forceShowForCurrentShipping || form.postalCode !== "") &&
      !isValidPostalCodeES(form.postalCode);

    provinceError =
      (forceShowForCurrentShipping || form.province !== "") &&
      !isNonEmptyMin(form.province, 2);

    cityError =
      (forceShowForCurrentShipping || form.city !== "") &&
      !isNonEmptyMin(form.city, 2);
  } else if (form.shippingType === "store" && forceShowForCurrentShipping) {
    storeLocationError = !form.storeLocationId;
  } else if (form.shippingType === "pickup" && forceShowForCurrentShipping) {
    pickupLocationError = !form.pickupLocationId;

    pickupSearchError =
      (forceShowForCurrentShipping || form.pickupSearch !== "") &&
      !isNonEmptyMin(form.pickupSearch, 3);
  }

  const errors: CheckoutClientErrors = {
    firstName: firstNameError,
    lastName: lastNameError,
    email: emailError,
    phone: phoneError,
    street: streetError,
    postalCode: postalCodeError,
    province: provinceError,
    city: cityError,
    storeLocation: storeLocationError,
    pickupLocation: pickupLocationError,
    pickupSearch: pickupSearchError,
  };

  // ------------------------
  // Handlers
  // ------------------------

  function handleChange<K extends keyof CheckoutFormState>(
    key: K,
    value: CheckoutFormState[K],
  ) {
    setForm((prev) => {
      const next = {
        ...prev,
        [key]: value,
      } as CheckoutFormState;

      return next;
    });

    // Si cambia el tipo de envío, "reseteamos" la tarjeta que había fallado
    if (key === "shippingType") {
      setInvalidShippingType(null);
      // Mantenemos showAllErrors para que siga marcando campos
      // si el usuario ya empezó a rellenar, pero no forzamos errores
      // en la nueva tarjeta hasta que vuelva a pulsar Continuar.
    }
  }

  function handleNext() {
    setStep((current) => {
      if (current === 1 && !isValid) {
        setShowAllErrors(true);
        setInvalidShippingType(form.shippingType);
        return current;
      }

      const next = (current + 1) as CheckoutStep;
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
      if (target >= current) return current;
      return target;
    });
  }

  function resetForm() {
    setForm(INITIAL_FORM_STATE);
    setStep(1);
    setShowAllErrors(false);
    setInvalidShippingType(null);
  }

  return {
    form,
    isValid,
    step,
    errors,
    handleChange,
    handleNext,
    handlePrev,
    handleStepperClick,
    resetForm,
  };
}
