"use client";

import {
  IoHomeOutline,
  IoStorefront,
  IoHome,
  IoLocationOutline,
  IoLocationSharp,
  IoStorefrontOutline,
} from "react-icons/io5";

import {
  CheckoutShippingHome,
  CheckoutShippingPickup,
  CheckoutShippingStore,
} from "@/components/checkout/shipping";

import type {
  CheckoutClientErrors,
  CheckoutFormState,
  ShippingType,
} from "@/hooks/use-checkout-form";

type ShippingStepProps = {
  form: CheckoutFormState;
  errors: CheckoutClientErrors;
  onChange: <K extends keyof CheckoutFormState>(
    key: K,
    value: CheckoutFormState[K],
  ) => void;
};

const SHIPPING_ICONS = {
  home: {
    outline: IoHomeOutline,
    solid: IoHome,
  },
  store: {
    outline: IoStorefrontOutline,
    solid: IoStorefront,
  },
  pickup: {
    outline: IoLocationOutline,
    solid: IoLocationSharp,
  },
} as const;

const SHIPPING_OPTIONS: {
  id: ShippingType;
  title: string;
}[] = [
  {
    id: "home",
    title: "Envío a domicilio",
  },
  {
    id: "pickup",
    title: "Punto de recogida",
  },
  {
    id: "store",
    title: "Recogida en tienda",
  },
];

export function CheckoutShippingStep({
  form,
  errors,
  onChange,
}: ShippingStepProps) {
  const { shippingType } = form;

  return (
    <div className="space-y-4 pb-4">
      {/* Selector de tipo de envío */}
      <div className="space-y-3">
        <div className="grid gap-3 sm:grid-cols-3">
          {SHIPPING_OPTIONS.map((option) => {
            const isActive = shippingType === option.id;
            const Icon =
              SHIPPING_ICONS[option.id as "home" | "store" | "pickup"][
                isActive ? "solid" : "outline"
              ];

            return (
              <button
                key={option.id}
                type="button"
                onClick={() => onChange("shippingType", option.id)}
<<<<<<< HEAD
                className={`flex h-full flex-col items-center justify-center gap-2 rounded-xs border px-3 py-4 text-sm sm:text-sm transition-colors ${
=======
                className={`flex h-full flex-col items-center justify-center gap-2 rounded-lb border px-3 py-4 text-sm sm:text-sm transition-colors ${
>>>>>>> b4c8f25 (feat(fase-6): pedidos con datos de envío en Prisma + vista demo de orders (#29))
                  isActive
                    ? "border-primary text-foreground"
                    : "border-border bg-neutral-100 hover:border-primary hover:cursor-pointer"
                }`}
                aria-pressed={isActive}
              >
                <span className="sm:text-lg">
                  <Icon size={18} />
                </span>
                <span className="lg:text-sm sm:text-sm font-medium text-foreground">
                  {option.title}
                </span>
              </button>
            );
          })}
        </div>
      </div>

      {/* Secciones específicas según tipo de envío */}
      {shippingType === "home" && (
        <CheckoutShippingHome form={form} errors={errors} onChange={onChange} />
      )}

      {shippingType === "pickup" && (
        <CheckoutShippingPickup
          form={form}
          errors={errors}
          onChange={onChange}
        />
      )}

      {shippingType === "store" && (
        <CheckoutShippingStore
          form={form}
          errors={errors}
          onChange={onChange}
        />
      )}
    </div>
  );
}
