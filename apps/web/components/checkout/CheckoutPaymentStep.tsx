import type { PaymentMethod } from "@/hooks/use-checkout-form";

type PaymentStepProps = {
  paymentMethod: PaymentMethod;
};

export function CheckoutPaymentStep({ paymentMethod }: PaymentStepProps) {
  return (
    <div className="space-y-4">
      <div className="space-y-3 rounded-lb p-4 text-sm">
        <p className="font-medium">Pago online con tarjeta</p>
      </div>
    </div>
  );
}
