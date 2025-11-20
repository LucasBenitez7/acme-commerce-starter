import { Input, Label } from "@/components/ui";

import type {
  CheckoutClientErrors,
  CheckoutFormState,
} from "@/hooks/use-checkout-form";

type CheckoutContactFieldsProps = {
  form: CheckoutFormState;
  errors: CheckoutClientErrors;
  onChange: <K extends keyof CheckoutFormState>(
    key: K,
    value: CheckoutFormState[K],
  ) => void;
};

export function CheckoutContactFields({
  form,
  errors,
  onChange,
}: CheckoutContactFieldsProps) {
  const { firstName, lastName, email, phone } = form;

  const {
    firstName: firstNameError,
    lastName: lastNameError,
    email: emailError,
    phone: phoneError,
  } = errors;

  return (
    <div className="space-y-4">
      <div className="grid gap-4 sm:grid-cols-2">
        <div className="space-y-2">
          <Label htmlFor="firstName">Nombre*</Label>
          <Input
            id="firstName"
            name="firstName"
            autoComplete="given-name"
            value={firstName}
            onChange={(e) => onChange("firstName", e.target.value)}
            required
            aria-invalid={firstNameError || undefined}
            aria-describedby={firstNameError ? "firstName-error" : undefined}
          />
          {firstNameError && (
            <p id="firstName-error" className="text-xs text-destructive">
              Introduce tu nombre.
            </p>
          )}
        </div>

        <div className="space-y-2">
          <Label htmlFor="lastName">Apellidos*</Label>
          <Input
            id="lastName"
            name="lastName"
            autoComplete="family-name"
            value={lastName}
            onChange={(e) => onChange("lastName", e.target.value)}
            required
            aria-invalid={lastNameError || undefined}
            aria-describedby={lastNameError ? "lastName-error" : undefined}
          />
          {lastNameError && (
            <p id="lastName-error" className="text-xs text-destructive">
              Introduce tus apellidos.
            </p>
          )}
        </div>
      </div>

      <div className="grid gap-4 sm:grid-cols-2">
        <div className="space-y-2">
          <Label htmlFor="email">E-mail*</Label>
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
          <Label htmlFor="phone">Teléfono*</Label>
          <Input
            id="phone"
            name="phone"
            type="tel"
            autoComplete="tel"
            value={phone}
            onChange={(e) => onChange("phone", e.target.value)}
            required
            aria-invalid={phoneError || undefined}
            aria-describedby={phoneError ? "phone-error" : undefined}
          />
          {phoneError && (
            <p id="phone-error" className="text-xs text-destructive">
              Introduce un teléfono válido (solo números y signos habituales).
            </p>
          )}
        </div>
      </div>
    </div>
  );
}
