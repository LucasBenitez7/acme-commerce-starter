import type { CheckoutFormState } from "@/hooks/use-checkout-form";

type ReviewStepProps = {
  form: CheckoutFormState;
};

export function CheckoutReviewStep({ form }: ReviewStepProps) {
  const { fullName, email, address, city, phone, paymentMethod } = form;

  return (
    <div className="space-y-4">
      <p className="text-sm font-medium text-muted-foreground">
        Paso 3 de 3 · Revisa y confirma
      </p>

      <div className="space-y-3 rounded-lg border bg-muted/40 p-4 text-sm">
        <div>
          <p className="font-semibold">Datos de envío</p>
          <dl className="mt-2 space-y-1 text-xs text-muted-foreground">
            <div className="flex gap-2">
              <dt className="w-20 shrink-0 font-medium text-foreground">
                Nombre
              </dt>
              <dd>{fullName || "—"}</dd>
            </div>
            <div className="flex gap-2">
              <dt className="w-20 shrink-0 font-medium text-foreground">
                Email
              </dt>
              <dd>{email || "—"}</dd>
            </div>
            <div className="flex gap-2">
              <dt className="w-20 shrink-0 font-medium text-foreground">
                Dirección
              </dt>
              <dd>{address || "—"}</dd>
            </div>
            <div className="flex gap-2">
              <dt className="w-20 shrink-0 font-medium text-foreground">
                Ciudad
              </dt>
              <dd>{city || "—"}</dd>
            </div>
            <div className="flex gap-2">
              <dt className="w-20 shrink-0 font-medium text-foreground">
                Teléfono
              </dt>
              <dd>{phone || "—"}</dd>
            </div>
          </dl>
        </div>

        <div className="h-px w-full bg-border" />

        <div>
          <p className="font-semibold">Método de pago</p>
          <p className="mt-1 text-xs text-muted-foreground">
            Pago online con tarjeta (simulado).
          </p>
        </div>

        <p className="mt-2 text-xs text-muted-foreground">
          Si todo es correcto, haz clic en{" "}
          <span className="font-medium">“Realizar pedido”</span> para crear el
          pedido de prueba.
        </p>
      </div>

      {/* Inputs ocultos para enviar los datos al servidor en el submit */}
      <input type="hidden" name="fullName" value={fullName} />
      <input type="hidden" name="email" value={email} />
      <input type="hidden" name="address" value={address} />
      <input type="hidden" name="city" value={city} />
      <input type="hidden" name="phone" value={phone} />
      <input type="hidden" name="paymentMethod" value={paymentMethod} />
    </div>
  );
}
