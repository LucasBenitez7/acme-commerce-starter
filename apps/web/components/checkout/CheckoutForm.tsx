"use client";
import Link from "next/link";
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
      className="w-full md:w-auto hover:cursor-pointer"
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
    errors,
    handleChange,
    handleNext,
    handlePrev,
    handleStepperClick,
  } = useCheckoutForm();

  const { shippingType, storeLocationId, pickupLocationId } = form;

  const canShowNextButton =
    step === 1
      ? shippingType === "home" ||
        (shippingType === "store" && !!storeLocationId) ||
        (shippingType === "pickup" && !!pickupLocationId)
      : true;

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
      <CheckoutStepper currentStep={step} onStepClick={handleStepperClick} />

      <form
        className="p-4 space-y-4 border rounded-lb bg-background"
        action={formAction}
        noValidate
        onSubmit={handleSubmit}
      >
        {serverState?.error && (
          <div
            ref={errorRef}
            tabIndex={-1}
            className="rounded-lb border border-destructive/40 bg-destructive/10 px-3 py-2 text-sm text-destructive"
            role="alert"
            aria-live="assertive"
          >
            {serverState.error}
          </div>
        )}
        <h2 className="text-lg font-semibold text-foreground mb-2">
          {isStep1 && "Elige un metodo de envío"}
          {isStep2 && "Elige un metodo de pago"}
          {isStep3 && "Revisa y finaliza tu pedido"}
        </h2>

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
        {isStep3 && (
          <CheckoutReviewStep
            form={form}
            onEditShipping={() => handleStepperClick(1)}
            onEditContact={() => handleStepperClick(1)}
            onEditPayment={() => handleStepperClick(2)}
          />
        )}

        {/* Navegación entre pasos */}
        <div className="flex flex-col gap-3 font-medium pt-2 text-sm sm:flex-row sm:items-center sm:justify-between">
          <div>
            {step === 1 && (
              <Link
                href="/cart"
                className="text-muted-foreground fx-underline-anim hover:cursor-pointer hover:text-primary transition-all duration-200 ease-in-out"
              >
                ← Volver a la cesta
              </Link>
            )}
            {step > 1 && (
              <button
                type="button"
                className="text-muted-foreground fx-underline-anim hover:cursor-pointer hover:text-primary transition-all duration-200 ease-in-out"
                onClick={handlePrev}
              >
                {step === 2 && "← Volver al tipo de envío"}
                {step === 3 && "← Volver al método de pago"}
              </button>
            )}
          </div>

          <div className="flex flex-col gap-2 sm:flex-row sm:items-center sm:gap-3">
            {step < 3 && canShowNextButton && (
              <Button
                type="button"
                className="w-full sm:w-auto hover:cursor-pointer"
                variant="default"
                onClick={handleNext}
              >
                {step === 1 ? "Continuar con el pago" : "Continuar al resumen"}
              </Button>
            )}

            {step === 3 && <SubmitButton disabledBase={!isValid} />}
          </div>
        </div>
      </form>
    </div>
  );
}
