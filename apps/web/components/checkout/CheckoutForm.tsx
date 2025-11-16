"use client";

import { useEffect, useRef, useActionState, type FormEvent } from "react";
import { useFormStatus } from "react-dom";

import {
  CheckoutPaymentStep,
  CheckoutReviewStep,
  CheckoutShippingStep,
  CheckoutStepper,
} from "@/components/checkout";
import { Button } from "@/components/ui";

import {
  createOrderAction,
  type CheckoutActionState,
} from "@/app/(site)/(shop)/checkout/actions";
import { useCheckoutForm } from "@/hooks/use-checkout-form";

const INITIAL_SERVER_STATE: CheckoutActionState = {
  error: undefined,
};

function SubmitButton({ disabledBase }: { disabledBase: boolean }) {
  const { pending } = useFormStatus();

  return (
    <Button
      type="submit"
      className="w-full md:w-auto"
      disabled={disabledBase || pending}
    >
      {pending ? "Procesando pedido..." : "Realizar pedido"}
    </Button>
  );
}

export function CheckoutForm() {
  const [serverState, formAction] = useActionState<
    CheckoutActionState,
    FormData
  >(createOrderAction, INITIAL_SERVER_STATE);

  const {
    form,
    isValid,
    step,
    maxStepReached,
    errors,
    handleChange,
    handleNext,
    handlePrev,
    handleStepperClick,
  } = useCheckoutForm();

  const errorRef = useRef<HTMLDivElement | null>(null);

  // Focus y scroll al banner de error del servidor
  useEffect(() => {
    if (serverState?.error && errorRef.current) {
      errorRef.current.focus();
      errorRef.current.scrollIntoView({
        behavior: "smooth",
        block: "start",
      });
    }
  }, [serverState?.error]);

  function handleSubmit(event: FormEvent<HTMLFormElement>) {
    if (step < 3) {
      event.preventDefault();
      handleNext();
      return;
    }
  }

  const isStep1 = step === 1;
  const isStep2 = step === 2;
  const isStep3 = step === 3;

  return (
    <div className="space-y-4">
      {/* Stepper de pasos del checkout */}
      <CheckoutStepper
        currentStep={step}
        maxStepReached={maxStepReached}
        onStepClick={handleStepperClick}
      />

      <form
        className="space-y-6"
        action={formAction}
        noValidate
        onSubmit={handleSubmit}
      >
        {serverState?.error && (
          <div
            ref={errorRef}
            tabIndex={-1}
            className="rounded-md border border-destructive/40 bg-destructive/10 px-3 py-2 text-sm text-destructive"
            role="alert"
            aria-live="assertive"
          >
            {serverState.error}
          </div>
        )}

        {/* Paso 1: datos de envío */}
        {isStep1 && (
          <CheckoutShippingStep
            form={form}
            errors={errors}
            onChange={handleChange}
          />
        )}

        {/* Paso 2: método de pago */}
        {isStep2 && <CheckoutPaymentStep paymentMethod={form.paymentMethod} />}

        {/* Paso 3: resumen final + inputs ocultos */}
        {isStep3 && <CheckoutReviewStep form={form} />}

        {/* Navegación entre pasos */}
        <div className="flex flex-col gap-3 border-t pt-4 text-sm sm:flex-row sm:items-center sm:justify-between">
          <div>
            {step > 1 && (
              <button
                type="button"
                className="text-xs font-medium text-muted-foreground underline-offset-2 hover:underline"
                onClick={handlePrev}
              >
                ← Volver al paso anterior
              </button>
            )}
          </div>

          <div className="flex flex-col gap-2 sm:flex-row sm:items-center sm:gap-3">
            {step < 3 && (
              <Button
                type="button"
                className="w-full sm:w-auto"
                variant="default"
                onClick={handleNext}
                disabled={step === 1 && !isValid}
              >
                {step === 1 ? "Continuar con el pago" : "Continuar al resumen"}
              </Button>
            )}

            {step === 3 && <SubmitButton disabledBase={!isValid} />}
          </div>
        </div>

        <p className="text-xs text-muted-foreground">
          Este checkout es de prueba. Más adelante conectaremos el pago con
          tarjeta y la creación de pedidos reales.
        </p>
      </form>
    </div>
  );
}
