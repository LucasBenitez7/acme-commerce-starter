import type { PaymentMethod } from "@/hooks/use-checkout-form";

type PaymentStepProps = {
  paymentMethod: PaymentMethod;
};

export function CheckoutPaymentStep({ paymentMethod }: PaymentStepProps) {
  return (
    <div className="space-y-4">
      <p className="text-sm font-medium text-muted-foreground">
        Paso 2 de 3 · Método de pago
      </p>

      <div className="space-y-3 rounded-lg border bg-muted/40 p-4 text-sm">
        <p className="font-medium">Pago online con tarjeta</p>
        <p className="text-xs text-muted-foreground">
          En el futuro conectaremos este paso con un proveedor de pagos (Stripe
          / Redsys). De momento, el pedido se crea en modo prueba.
        </p>
      </div>
    </div>
  );
}
