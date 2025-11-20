import { PAYMENT_METHOD_OPTIONS } from "@/components/checkout/payment/methods";

import type { CheckoutFormState } from "@/hooks/use-checkout-form";

type CheckoutPaymentStepProps = {
  form: CheckoutFormState;
  onChange: <K extends keyof CheckoutFormState>(
    key: K,
    value: CheckoutFormState[K],
  ) => void;
};

export function CheckoutPaymentStep({
  form,
  onChange,
}: CheckoutPaymentStepProps) {
  const { paymentMethod } = form;

  return (
    <div className="space-y-4 pt-2 pb-4">
      <div className="grid gap-3 sm:grid-cols-1">
        {PAYMENT_METHOD_OPTIONS.map((option) => {
          const isSelected = paymentMethod === option.id;
          const Icon = option.icon;

          return (
            <label
              key={option.id}
              className={`flex cursor-pointer flex-col rounded-lb border p-3 py-6 text-sm text-left transition-colors
                ${
                  isSelected
                    ? "border-primary"
                    : "border-border bg-neutral-50 hover:border-primary"
                }`}
            >
              <input
                type="radio"
                name="paymentMethod"
                value={option.id}
                checked={isSelected}
                onChange={() => onChange("paymentMethod", option.id)}
                className="sr-only"
              />

              <div className="flex items-start justify-between gap-2">
                <div className="flex items-center gap-2">
                  <span
                    aria-hidden="true"
                    className={`inline-flex h-3 w-3 items-center justify-center rounded-full border-2
                    ${
                      isSelected
                        ? "border-primary bg-primary"
                        : "border-muted-foreground/40"
                    }`}
                  />
                  <p className="font-semibold">{option.title}</p>
                </div>
                {Icon && (
                  <Icon
                    aria-hidden="true"
                    className="h-5 w-5 text-foreground"
                  />
                )}
              </div>
            </label>
          );
        })}
      </div>
    </div>
  );
}
