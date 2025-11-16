import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";

import type {
  CheckoutClientErrors,
  CheckoutFormState,
} from "@/hooks/use-checkout-form";

type ShippingStepProps = {
  form: CheckoutFormState;
  errors: CheckoutClientErrors;
  onChange: <K extends keyof CheckoutFormState>(
    key: K,
    value: CheckoutFormState[K],
  ) => void;
};

export function CheckoutShippingStep({
  form,
  errors,
  onChange,
}: ShippingStepProps) {
  const { fullName, email, address, city, phone } = form;
  const {
    fullName: fullNameError,
    email: emailError,
    address: addressError,
    city: cityError,
    phone: phoneError,
  } = errors;

  return (
    <div className="space-y-4">
      <p className="text-sm font-medium text-muted-foreground">
        Paso 1 de 3 · Datos de envío
      </p>

      <div className="space-y-2">
        <Label htmlFor="fullName">Nombre completo</Label>
        <Input
          id="fullName"
          name="fullName"
          autoComplete="name"
          value={fullName}
          onChange={(e) => onChange("fullName", e.target.value)}
          required
          aria-invalid={fullNameError || undefined}
          aria-describedby={fullNameError ? "fullName-error" : undefined}
        />
        {fullNameError && (
          <p id="fullName-error" className="text-xs text-destructive">
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
          value={email}
          onChange={(e) => onChange("email", e.target.value)}
          required
          aria-invalid={emailError || undefined}
          aria-describedby={emailError ? "email-error" : undefined}
        />
        {emailError && (
          <p id="email-error" className="text-xs text-destructive">
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
          value={address}
          onChange={(e) => onChange("address", e.target.value)}
          required
          aria-invalid={addressError || undefined}
          aria-describedby={addressError ? "address-error" : undefined}
        />
        {addressError && (
          <p id="address-error" className="text-xs text-destructive">
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
          value={city}
          onChange={(e) => onChange("city", e.target.value)}
          required
          aria-invalid={cityError || undefined}
          aria-describedby={cityError ? "city-error" : undefined}
        />
        {cityError && (
          <p id="city-error" className="text-xs text-destructive">
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
          value={phone}
          onChange={(e) => onChange("phone", e.target.value)}
          aria-invalid={phoneError || undefined}
          aria-describedby={phoneError ? "phone-error" : undefined}
        />
        {phoneError && (
          <p id="phone-error" className="text-xs text-destructive">
            El teléfono solo puede contener números y signos habituales (+,
            espacios, guiones).
          </p>
        )}
      </div>
    </div>
  );
}
