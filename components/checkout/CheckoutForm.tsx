"use client";

import { useRouter } from "next/navigation";
import { useState, useTransition } from "react";
import { FormProvider, type SubmitHandler } from "react-hook-form";

import { LeaveCheckoutDialog } from "@/components/checkout/core/LeaveCheckoutDialog";
import { CheckoutStepper } from "@/components/checkout/layout";
import {
  CheckoutPaymentStep,
  CheckoutReviewStep,
  CheckoutShippingStep,
} from "@/components/checkout/steps";
import { Button } from "@/components/ui";

import { createOrderAction } from "@/app/(site)/(shop)/checkout/actions";
import { useCheckoutForm } from "@/hooks/use-checkout-form";

import type { CheckoutFormValues } from "@/lib/validation/checkout";

type Props = {
  defaultFirstName?: string | null;
  defaultLastName?: string | null;
  defaultEmail?: string | null;
  defaultPhone?: string | null;
};

export function CheckoutForm({
  defaultFirstName,
  defaultLastName,
  defaultEmail,
  defaultPhone,
}: Props) {
  const router = useRouter();
  const [showLeaveDialog, setShowLeaveDialog] = useState(false);
  const [isPending, startTransition] = useTransition();
  const [serverError, setServerError] = useState<string | null>(null);

  const {
    methods,
    step,
    handleNext,
    handlePrev,
    setStep,
    isLoading,
    clearProgress,
  } = useCheckoutForm({
    defaults: {
      firstName: defaultFirstName || "",
      lastName: defaultLastName || "",
      email: defaultEmail || "",
      phone: defaultPhone || "",
    },
  });

  const { handleSubmit } = methods;

  const onSubmit: SubmitHandler<CheckoutFormValues> = (data) => {
    if (step !== 3) return;

    setServerError(null);

    startTransition(async () => {
      const formData = new FormData();

      Object.entries(data).forEach(([key, val]) => {
        if (val !== null && val !== undefined) {
          formData.append(key, String(val));
        }
      });

      const result = await createOrderAction({ error: undefined }, formData);

      if (result?.error) {
        setServerError(result.error);
      } else {
        if (clearProgress) clearProgress();
        router.push("/checkout/success");
      }
    });
  };

  if (isLoading)
    return <div className="p-10 text-center">Cargando checkout...</div>;

  return (
    <FormProvider {...methods}>
      <div className="border border-border rounded-lg bg-card">
        <CheckoutStepper currentStep={step} onStepClick={setStep} />

        <form onSubmit={(e) => e.preventDefault()} className="p-4 sm:p-6">
          {serverError && (
            <div className="mb-4 p-3 bg-red-50 text-red-600 rounded-md text-sm border border-red-200">
              Error: {serverError}
            </div>
          )}

          <h2 className="text-xl font-semibold mb-6">
            {step === 1 && "Elige un método de envío"}
            {step === 2 && "Elige un método de pago"}
            {step === 3 && "Revisa y finaliza tu pedido"}
          </h2>

          {/* Renderizado condicional de Pasos */}
          <div className={step === 1 ? "block" : "hidden"}>
            <CheckoutShippingStep />
          </div>

          <div className={step === 2 ? "block" : "hidden"}>
            <CheckoutPaymentStep />
          </div>

          <div className={step === 3 ? "block" : "hidden"}>
            <CheckoutReviewStep
              onEditShipping={() => setStep(1)}
              onEditPayment={() => setStep(2)}
            />
          </div>

          {/* Botones de Navegación */}
          <div className="mt-8 flex flex-col-reverse sm:flex-row sm:justify-between sm:items-center gap-4">
            {step === 1 ? (
              <button
                type="button"
                className="text-sm text-muted-foreground hover:text-primary transition-colors"
                onClick={() => setShowLeaveDialog(true)}
              >
                ← Volver a la cesta
              </button>
            ) : (
              <Button
                type="button"
                variant="ghost"
                onClick={handlePrev}
                disabled={isPending}
              >
                ← Volver
              </Button>
            )}

            <div className="w-full sm:w-auto">
              {step < 3 && (
                <Button
                  type="button"
                  className="w-full hover:cursor-pointer p-3 sm:py-2 sm:w-auto"
                  onClick={handleNext}
                >
                  Continuar
                </Button>
              )}

              {step === 3 && (
                <Button
                  type="button"
                  className="w-full px-4 text-sm hover:cursor-pointer md:w-auto bg-green-600 hover:bg-green-700 text-white shadow-md"
                  disabled={isPending}
                  onClick={handleSubmit(onSubmit)}
                >
                  {isPending ? "Procesando pedido..." : "Pagar y finalizar"}
                </Button>
              )}
            </div>
          </div>
        </form>

        <LeaveCheckoutDialog
          open={showLeaveDialog}
          onClose={() => setShowLeaveDialog(false)}
          onConfirm={() => {
            setShowLeaveDialog(false);
            router.push("/cart");
          }}
          title="¿Volver a la cesta?"
          description="Perderás el progreso actual del checkout."
          confirmLabel="Sí, volver"
          cancelLabel="Quedarme"
        />
      </div>
    </FormProvider>
  );
}
