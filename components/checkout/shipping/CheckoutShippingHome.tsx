import { useFormContext } from "react-hook-form";

import { Input, Label } from "@/components/ui";

import type { CheckoutFormValues } from "@/lib/validation/checkout";

export function CheckoutShippingHome() {
  const {
    register,
    formState: { errors },
  } = useFormContext<CheckoutFormValues>();

  return (
    <div className="space-y-6">
      <div>
        <p className="text-base font-medium text-foreground pb-1">
          Dirección de entrega
        </p>
        <div className="space-y-6 p-4 border rounded-lg bg-card">
          <div className="space-y-2">
            <Label htmlFor="street" className="text-xs">
              Calle y número*
            </Label>
            <Input
              id="street"
              autoComplete="street-address"
              placeholder="Av. Principal 123, 4ºA"
              {...register("street")}
              aria-invalid={!!errors.street}
            />
            {errors.street && (
              <p className="text-xs text-destructive">
                {errors.street.message}
              </p>
            )}
          </div>

          <div className="space-y-2">
            <Label htmlFor="addressExtra" className="text-xs">
              Información adicional (Opcional)
            </Label>
            <Input
              id="addressExtra"
              placeholder="Código de acceso, dejar en portería..."
              {...register("addressExtra")}
            />
          </div>

          <div className="grid gap-4 grid-cols-2 sm:grid-cols-4">
            <div className="space-y-2 col-span-2 sm:col-span-1">
              <Label htmlFor="postalCode" className="text-xs">
                C. Postal*
              </Label>
              <Input
                id="postalCode"
                autoComplete="postal-code"
                placeholder="28001"
                {...register("postalCode")}
                aria-invalid={!!errors.postalCode}
              />
              {errors.postalCode && (
                <p className="text-xs text-destructive">
                  {errors.postalCode.message}
                </p>
              )}
            </div>

            <div className="space-y-2 col-span-2 sm:col-span-2">
              <Label htmlFor="province" className="text-xs">
                Provincia*
              </Label>
              <Input
                id="province"
                autoComplete="address-level1"
                placeholder="Madrid"
                {...register("province")}
                aria-invalid={!!errors.province}
              />
              {errors.province && (
                <p className="text-xs text-destructive">
                  {errors.province.message}
                </p>
              )}
            </div>

            <div className="space-y-2 col-span-2 sm:col-span-1">
              <Label htmlFor="city" className="text-xs">
                Ciudad*
              </Label>
              <Input
                id="city"
                autoComplete="address-level2"
                placeholder="Madrid"
                {...register("city")}
                aria-invalid={!!errors.city}
              />
              {errors.city && (
                <p className="text-xs text-destructive">
                  {errors.city.message}
                </p>
              )}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
