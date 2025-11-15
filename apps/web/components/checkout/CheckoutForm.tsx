"use client";
import { useEffect, useState, useActionState } from "react";
import { useFormStatus } from "react-dom";

import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";

import {
  createOrderAction,
  type CheckoutActionState,
} from "@/app/(site)/(shop)/checkout/actions";

type FormState = {
  fullName: string;
  email: string;
  address: string;
  city: string;
  phone: string;
};

const INITIAL_SERVER_STATE: CheckoutActionState = {
  error: undefined,
};

function isValidEmail(email: string): boolean {
  if (!email) return false;
  return /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email);
}

function isNonEmptyMin(text: string, min: number): boolean {
  return text.trim().length >= min;
}

function isValidPhone(phone: string): boolean {
  if (!phone) return true; // opcional
  return /^[0-9+\s()-]{6,20}$/.test(phone);
}

function SubmitButton({ disabledBase }: { disabledBase: boolean }) {
  const { pending } = useFormStatus();

  return (
    <Button
      type="submit"
      className="w-full md:w-auto"
      disabled={disabledBase || pending}
    >
      {pending ? "Procesando pedido..." : "Realizar pedido"}
    </Button>
  );
}

export function CheckoutForm() {
  const [serverState, formAction] = useActionState<
    CheckoutActionState,
    FormData
  >(createOrderAction, INITIAL_SERVER_STATE);

  const [form, setForm] = useState<FormState>({
    fullName: "",
    email: "",
    address: "",
    city: "",
    phone: "",
  });

  const [isValid, setIsValid] = useState(false);

  useEffect(() => {
    const valid =
      isNonEmptyMin(form.fullName, 3) &&
      isValidEmail(form.email) &&
      isNonEmptyMin(form.address, 5) &&
      isNonEmptyMin(form.city, 2) &&
      isValidPhone(form.phone);

    setIsValid(valid);
  }, [form]);

  function handleChange<K extends keyof FormState>(
    key: K,
    value: FormState[K],
  ) {
    setForm((prev) => ({
      ...prev,
      [key]: value,
    }));
  }

  return (
    <form className="space-y-6" action={formAction} noValidate>
      {serverState?.error && (
        <div
          className="rounded-md border border-destructive/40 bg-destructive/10 px-3 py-2 text-sm text-destructive"
          role="alert"
        >
          {serverState.error}
        </div>
      )}

      <div className="space-y-4">
        <div className="space-y-2">
          <Label htmlFor="fullName">Nombre completo</Label>
          <Input
            id="fullName"
            name="fullName"
            autoComplete="name"
            value={form.fullName}
            onChange={(e) => handleChange("fullName", e.target.value)}
            required
          />
          {form.fullName && !isNonEmptyMin(form.fullName, 3) && (
            <p className="text-xs text-destructive">
              Introduce tu nombre y apellidos.
            </p>
          )}
        </div>

        <div className="space-y-2">
          <Label htmlFor="email">Correo electrónico</Label>
          <Input
            id="email"
            name="email"
            type="email"
            autoComplete="email"
            value={form.email}
            onChange={(e) => handleChange("email", e.target.value)}
            required
          />
          {form.email && !isValidEmail(form.email) && (
            <p className="text-xs text-destructive">
              Introduce un correo electrónico válido.
            </p>
          )}
        </div>

        <div className="space-y-2">
          <Label htmlFor="address">Dirección</Label>
          <Input
            id="address"
            name="address"
            autoComplete="street-address"
            value={form.address}
            onChange={(e) => handleChange("address", e.target.value)}
            required
          />
          {form.address && !isNonEmptyMin(form.address, 5) && (
            <p className="text-xs text-destructive">
              Introduce una dirección un poco más detallada.
            </p>
          )}
        </div>

        <div className="space-y-2">
          <Label htmlFor="city">Ciudad</Label>
          <Input
            id="city"
            name="city"
            autoComplete="address-level2"
            value={form.city}
            onChange={(e) => handleChange("city", e.target.value)}
            required
          />
          {form.city && !isNonEmptyMin(form.city, 2) && (
            <p className="text-xs text-destructive">
              Introduce el nombre de tu ciudad.
            </p>
          )}
        </div>

        <div className="space-y-2">
          <Label htmlFor="phone">Teléfono (opcional)</Label>
          <Input
            id="phone"
            name="phone"
            type="tel"
            autoComplete="tel"
            value={form.phone}
            onChange={(e) => handleChange("phone", e.target.value)}
          />
          {form.phone && !isValidPhone(form.phone) && (
            <p className="text-xs text-destructive">
              El teléfono solo puede contener números y signos habituales (+,
              espacios, guiones).
            </p>
          )}
        </div>
      </div>

      <div className="space-y-2">
        <p className="text-sm font-medium">Método de pago</p>
        <p className="text-sm text-muted-foreground">
          Pago online con tarjeta. La integración real se añadirá en una fase
          posterior (ej. Stripe / Redsys).
        </p>
      </div>

      <div>
        <SubmitButton disabledBase={!isValid} />
      </div>

      <p className="text-xs text-muted-foreground">
        Este checkout es de prueba. Más adelante conectaremos el pago con
        tarjeta y la creación de pedidos en la base de datos.
      </p>
    </form>
  );
}
