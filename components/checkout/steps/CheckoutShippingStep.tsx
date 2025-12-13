"use client";

import { useFormContext } from "react-hook-form";
import {
  IoHomeOutline,
  IoHome,
  IoStorefrontOutline,
  IoStorefront,
  IoLocationOutline,
  IoLocationSharp,
} from "react-icons/io5";

import {
  CheckoutShippingHome,
  CheckoutShippingPickup,
  CheckoutShippingStore,
} from "@/components/checkout/shipping";
import { CheckoutContactFields } from "@/components/checkout/shipping/CheckoutContactFields";

import type { CheckoutFormValues } from "@/lib/validation/checkout";

export function CheckoutShippingStep() {
  const { watch, setValue } = useFormContext<CheckoutFormValues>();

  const shippingType = watch("shippingType");

  const handleTypeChange = (type: "home" | "store" | "pickup") => {
    setValue("shippingType", type, {
      shouldValidate: true,
      shouldDirty: true,
    });
  };

  return (
    <div className="space-y-8 animate-in fade-in duration-500">
      {/* 1. SECCIÓN DE CONTACTO (Común) */}
      <section>
        <CheckoutContactFields />
      </section>

      {/* 2. SECCIÓN TIPO DE ENVÍO */}
      <section className="space-y-4">
        <h3 className="text-sm font-semibold text-foreground/80 px-1">
          Método de entrega
        </h3>

        {/* Selector de Botones con Iconos */}
        <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
          <ShippingOptionButton
            active={shippingType === "home"}
            onClick={() => handleTypeChange("home")}
            title="A domicilio"
            iconActive={IoHome}
            iconInactive={IoHomeOutline}
          />
          <ShippingOptionButton
            active={shippingType === "pickup"}
            onClick={() => handleTypeChange("pickup")}
            title="Punto de recogida"
            iconActive={IoLocationSharp}
            iconInactive={IoLocationOutline}
          />
          <ShippingOptionButton
            active={shippingType === "store"}
            onClick={() => handleTypeChange("store")}
            title="Tienda"
            iconActive={IoStorefront}
            iconInactive={IoStorefrontOutline}
          />
        </div>

        {/* Renderizado condicional del formulario específico */}
        <div className="pt-2">
          {shippingType === "home" && <CheckoutShippingHome />}
          {shippingType === "pickup" && <CheckoutShippingPickup />}
          {shippingType === "store" && <CheckoutShippingStore />}
        </div>
      </section>
    </div>
  );
}

// Componente pequeño local para limpiar el JSX del botón
function ShippingOptionButton({
  active,
  onClick,
  title,
  iconActive: IconActive,
  iconInactive: IconInactive,
}: any) {
  return (
    <button
      type="button"
      onClick={onClick}
      className={`
        flex flex-col items-center justify-center gap-2 rounded-lg border-2 p-4 transition-all duration-200
        ${
          active
            ? "border-primary bg-primary/5 text-primary shadow-sm"
            : "border-muted bg-card hover:border-primary/50 hover:bg-muted/50 text-muted-foreground"
        }
      `}
    >
      {active ? (
        <IconActive className="h-6 w-6" />
      ) : (
        <IconInactive className="h-6 w-6" />
      )}
      <span className="text-sm font-medium">{title}</span>
    </button>
  );
}
