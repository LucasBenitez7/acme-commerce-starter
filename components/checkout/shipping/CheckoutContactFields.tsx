"use client";

import { useFormContext } from "react-hook-form";

import { Input, Label } from "@/components/ui";

import type { CheckoutFormValues } from "@/lib/validation/checkout";

export function CheckoutContactFields() {
  const {
    register,
    formState: { errors },
  } = useFormContext<CheckoutFormValues>();

  return (
    <div className="space-y-6 rounded-lg border bg-card p-4">
      <h3 className="text-sm font-semibold text-foreground/80">
        Datos de contacto
      </h3>

      <div className="grid gap-4 sm:grid-cols-2">
        <div className="space-y-2">
          <Label htmlFor="firstName" className="text-xs">
            Nombre*
          </Label>
          <Input
            id="firstName"
            autoComplete="given-name"
            placeholder="Ej: Juan"
            {...register("firstName")}
            aria-invalid={!!errors.firstName}
          />
          {errors.firstName && (
            <p className="text-xs text-destructive">
              {errors.firstName.message}
            </p>
          )}
        </div>

        <div className="space-y-2">
          <Label htmlFor="lastName" className="text-xs">
            Apellidos*
          </Label>
          <Input
            id="lastName"
            autoComplete="family-name"
            placeholder="Ej: Pérez"
            {...register("lastName")}
            aria-invalid={!!errors.lastName}
          />
          {errors.lastName && (
            <p className="text-xs text-destructive">
              {errors.lastName.message}
            </p>
          )}
        </div>
      </div>

      <div className="grid gap-4 sm:grid-cols-2">
        <div className="space-y-2">
          <Label htmlFor="email" className="text-xs">
            E-mail*
          </Label>
          <Input
            id="email"
            type="email"
            autoComplete="email"
            placeholder="tu@email.com"
            {...register("email")}
            aria-invalid={!!errors.email}
          />
          {errors.email && (
            <p className="text-xs text-destructive">{errors.email.message}</p>
          )}
        </div>

        <div className="space-y-2">
          <Label htmlFor="phone" className="text-xs">
            Teléfono*
          </Label>
          <Input
            id="phone"
            type="tel"
            autoComplete="tel"
            placeholder="600 000 000"
            {...register("phone")}
            aria-invalid={!!errors.phone}
          />
          {errors.phone && (
            <p className="text-xs text-destructive">{errors.phone.message}</p>
          )}
        </div>
      </div>
    </div>
  );
}
