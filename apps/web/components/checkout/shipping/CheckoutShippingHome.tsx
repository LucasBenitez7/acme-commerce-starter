import { CheckoutContactFields } from "@/components/checkout/shipping/CheckoutContactFields";
import { Input, Label } from "@/components/ui";

import type {
  CheckoutClientErrors,
  CheckoutFormState,
} from "@/hooks/use-checkout-form";

type CheckoutShippingHomeProps = {
  form: CheckoutFormState;
  errors: CheckoutClientErrors;
  onChange: <K extends keyof CheckoutFormState>(
    key: K,
    value: CheckoutFormState[K],
  ) => void;
};

export function CheckoutShippingHome({
  form,
  errors,
  onChange,
}: CheckoutShippingHomeProps) {
  const { street, addressExtra, postalCode, province, city } = form;

  const {
    street: streetError,
    postalCode: postalCodeError,
    province: provinceError,
    city: cityError,
  } = errors;

  return (
    <div className="space-y-6">
      <div>
<<<<<<< HEAD
        <p className="text-base font-medium text-foreground pt-2 pb-1">
=======
        <p className="text-base font-medium text-foreground py-2">
>>>>>>> b4c8f25 (feat(fase-6): pedidos con datos de envío en Prisma + vista demo de orders (#29))
          Datos de contacto
        </p>
        <CheckoutContactFields
          form={form}
          errors={errors}
          onChange={onChange}
        />
      </div>

      <div>
<<<<<<< HEAD
        <p className="text-base font-medium text-foreground pb-1">
          Dirección de entrega
        </p>
        <div className="space-y-6 p-4 border ronded-lb">
          <div className="space-y-1">
            <Label htmlFor="street" className="text-xs">
              Calle y número*
            </Label>
=======
        <p className="text-base font-medium text-foreground pb-2">
          Dirección de entrega
        </p>
        <div className="space-y-4">
          <div className="space-y-1">
            <Label htmlFor="street">Calle y número*</Label>
>>>>>>> b4c8f25 (feat(fase-6): pedidos con datos de envío en Prisma + vista demo de orders (#29))
            <Input
              id="street"
              name="street"
              autoComplete="address-line1"
              value={street}
              onChange={(e) => onChange("street", e.target.value)}
              required
              aria-invalid={streetError || undefined}
              aria-describedby={streetError ? "street-error" : undefined}
            />
            {streetError && (
              <p id="street-error" className="text-xs text-destructive">
                Introduce una dirección un poco más detallada (calle y número).
              </p>
            )}
          </div>

          <div className="space-y-1">
<<<<<<< HEAD
            <Label htmlFor="addressExtra" className="text-xs">
              Escalera, piso... (opcional)
            </Label>
=======
            <Label htmlFor="addressExtra">Escalera, piso... (opcional)</Label>
>>>>>>> b4c8f25 (feat(fase-6): pedidos con datos de envío en Prisma + vista demo de orders (#29))
            <Input
              id="addressExtra"
              name="addressExtra"
              autoComplete="address-line2"
              value={addressExtra}
              onChange={(e) => onChange("addressExtra", e.target.value)}
<<<<<<< HEAD
=======
              placeholder="Escalera, portal, piso…"
>>>>>>> b4c8f25 (feat(fase-6): pedidos con datos de envío en Prisma + vista demo de orders (#29))
            />
          </div>

          <div className="grid gap-4 sm:grid-cols-3">
            <div className="space-y-1">
<<<<<<< HEAD
              <Label htmlFor="postalCode" className="text-xs">
                Código postal*
              </Label>
=======
              <Label htmlFor="postalCode">Código postal*</Label>
>>>>>>> b4c8f25 (feat(fase-6): pedidos con datos de envío en Prisma + vista demo de orders (#29))
              <Input
                id="postalCode"
                name="postalCode"
                autoComplete="postal-code"
                inputMode="numeric"
                value={postalCode}
                onChange={(e) => onChange("postalCode", e.target.value)}
                required
                aria-invalid={postalCodeError || undefined}
                aria-describedby={
                  postalCodeError ? "postalCode-error" : undefined
                }
              />
              {postalCodeError && (
                <p id="postalCode-error" className="text-xs text-destructive">
                  Introduce un código postal español válido (5 dígitos).
                </p>
              )}
            </div>

            <div className="space-y-1">
<<<<<<< HEAD
              <Label htmlFor="province" className="text-xs">
                Provincia*
              </Label>
=======
              <Label htmlFor="province">Provincia*</Label>
>>>>>>> b4c8f25 (feat(fase-6): pedidos con datos de envío en Prisma + vista demo de orders (#29))
              <Input
                id="province"
                name="province"
                autoComplete="address-level1"
                value={province}
                onChange={(e) => onChange("province", e.target.value)}
                required
                aria-invalid={provinceError || undefined}
                aria-describedby={provinceError ? "province-error" : undefined}
              />
              {provinceError && (
                <p id="province-error" className="text-xs text-destructive">
                  Introduce tu provincia.
                </p>
              )}
            </div>

            <div className="space-y-1">
<<<<<<< HEAD
              <Label htmlFor="city" className="text-xs">
                Ciudad*
              </Label>
              <Input
                className="placeholder:font-medium"
=======
              <Label htmlFor="city">Ciudad*</Label>
              <Input
>>>>>>> b4c8f25 (feat(fase-6): pedidos con datos de envío en Prisma + vista demo de orders (#29))
                id="city"
                name="city"
                autoComplete="address-level2"
                value={city}
                onChange={(e) => onChange("city", e.target.value)}
                required
                aria-invalid={cityError || undefined}
                aria-describedby={cityError ? "city-error" : undefined}
              />
              {cityError && (
                <p id="city-error" className="text-xs text-destructive">
                  Introduce tu ciudad.
                </p>
              )}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
