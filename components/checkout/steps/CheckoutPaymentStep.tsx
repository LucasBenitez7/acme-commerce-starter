import { useFormContext } from "react-hook-form";

import { PAYMENT_METHOD_OPTIONS } from "@/components/checkout/shared/methods";

import type { CheckoutFormValues } from "@/lib/validation/checkout";

export function CheckoutPaymentStep() {
  const { register, watch } = useFormContext<CheckoutFormValues>();

  const currentMethod = watch("paymentMethod");

  return (
    <div className="space-y-4 pb-4">
      <div className="grid gap-3 sm:grid-cols-1">
        {PAYMENT_METHOD_OPTIONS.map((option) => {
          const isSelected = currentMethod === option.id;
          const Icon = option.icon;

          return (
            <label
              key={option.id}
              className={`flex cursor-pointer flex-col rounded-xs border p-3 py-6 text-sm text-left transition-colors
                ${
                  isSelected
                    ? "border-primary"
                    : "border-border  hover:bg-neutral-50"
                }`}
            >
              <input
                type="radio"
                value={option.id}
                {...register("paymentMethod")}
                className="sr-only"
              />

              <div className="flex items-start justify-between gap-2">
                <div className="flex items-center gap-3">
                  <span
                    aria-hidden="true"
                    className={`h-4 w-4 absolute rounded-full p-1 border-2
                    ${
                      isSelected
                        ? "border-primary bg-background"
                        : "border-slate-300"
                    }`}
                  />
                  <span
                    aria-hidden="true"
                    className={`inline-flex h-3 w-3 translate-x-0.5 items-center justify-center rounded-full
                    ${isSelected ? "bg-primary border-2 border-background" : "bg-background"}`}
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
