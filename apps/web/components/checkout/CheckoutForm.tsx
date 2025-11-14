"use client";

import { useEffect, useState } from "react";

import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";

type FormState = {
  fullName: string;
  email: string;
  address: string;
  city: string;
  phone: string;
};

export function CheckoutForm() {
  const [form, setForm] = useState<FormState>({
    fullName: "",
    email: "",
    address: "",
    city: "",
    phone: "",
  });

  const [isValid, setIsValid] = useState(false);

  useEffect(() => {
    const basicFieldsFilled =
      form.fullName.trim().length > 2 &&
      form.email.trim().length > 5 &&
      form.address.trim().length > 5 &&
      form.city.trim().length > 1;

    setIsValid(basicFieldsFilled);
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

  function handleSubmit(e: React.FormEvent<HTMLFormElement>) {
    e.preventDefault();
    // TODO (Paso 4): conectar con Server Action para crear el pedido real
    // usando OrderDraft + datos del formulario.
  }

  return (
    <form className="space-y-6" onSubmit={handleSubmit} noValidate>
      <div className="space-y-4">
        <div className="space-y-2">
          <Label htmlFor="fullName">Nombre completo</Label>
          <Input
            id="fullName"
            autoComplete="name"
            value={form.fullName}
            onChange={(e) => handleChange("fullName", e.target.value)}
            required
          />
        </div>

        <div className="space-y-2">
          <Label htmlFor="email">Correo electrónico</Label>
          <Input
            id="email"
            type="email"
            autoComplete="email"
            value={form.email}
            onChange={(e) => handleChange("email", e.target.value)}
            required
          />
        </div>

        <div className="space-y-2">
          <Label htmlFor="address">Dirección</Label>
          <Input
            id="address"
            autoComplete="street-address"
            value={form.address}
            onChange={(e) => handleChange("address", e.target.value)}
            required
          />
        </div>

        <div className="space-y-2">
          <Label htmlFor="city">Ciudad</Label>
          <Input
            id="city"
            autoComplete="address-level2"
            value={form.city}
            onChange={(e) => handleChange("city", e.target.value)}
            required
          />
        </div>

        <div className="space-y-2">
          <Label htmlFor="phone">Teléfono (opcional)</Label>
          <Input
            id="phone"
            type="tel"
            autoComplete="tel"
            value={form.phone}
            onChange={(e) => handleChange("phone", e.target.value)}
          />
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
        <Button type="submit" className="w-full md:w-auto" disabled={!isValid}>
          Realizar pedido
        </Button>
      </div>

      <p className="text-xs text-muted-foreground">
        Este checkout es de prueba. Más adelante conectaremos el pago con
        tarjeta y la creación de pedidos en la base de datos.
      </p>
    </form>
  );
}
