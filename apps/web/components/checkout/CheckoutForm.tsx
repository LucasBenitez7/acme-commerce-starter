"use client";

import { useRouter } from "next/navigation";
import {
  useEffect,
  useRef,
  useActionState,
  type FormEvent,
  useState,
} from "react";
import { useFormStatus } from "react-dom";

import { LeaveCheckoutDialog } from "@/components/checkout/core/LeaveCheckoutDialog";
import {
  type CheckoutStep,
  CheckoutStepper,
} from "@/components/checkout/layout";
import {
  CheckoutPaymentStep,
  CheckoutReviewStep,
  CheckoutShippingStep,
} from "@/components/checkout/steps";
import { Button } from "@/components/ui";

import {
  createOrderAction,
  type CheckoutActionState,
} from "@/app/(site)/(shop)/checkout/actions";
import {
  useCheckoutForm,
  type CheckoutFormState,
} from "@/hooks/use-checkout-form";

<<<<<<< HEAD
type Props = {
  defaultFirstName?: string | null;
  defaultLastName?: string | null;
  defaultEmail?: string | null;
  defaultPhone?: string | null;
};

=======
>>>>>>> b4c8f25 (feat(fase-6): pedidos con datos de envío en Prisma + vista demo de orders (#29))
const INITIAL_SERVER_STATE: CheckoutActionState = {
  error: undefined,
};

function SubmitButton({ disabledBase }: { disabledBase: boolean }) {
  const { pending } = useFormStatus();

  return (
    <Button
      type="submit"
<<<<<<< HEAD
      className="w-full px-4 py-3 sm:py-2 text-sm hover:cursor-pointer md:w-auto bg-green-600 hover:bg-green-700"
=======
      className="w-full px-4 text-sm hover:cursor-pointer md:w-auto bg-green-600 hover:bg-green-700"
>>>>>>> b4c8f25 (feat(fase-6): pedidos con datos de envío en Prisma + vista demo de orders (#29))
      disabled={disabledBase || pending}
    >
      {pending ? "Procesando pedido..." : "Pagar y finalizar"}
    </Button>
  );
}

<<<<<<< HEAD
export function CheckoutForm({
  defaultFirstName,
  defaultLastName,
  defaultEmail,
  defaultPhone,
}: Props) {
=======
export function CheckoutForm() {
>>>>>>> b4c8f25 (feat(fase-6): pedidos con datos de envío en Prisma + vista demo de orders (#29))
  const [serverState, formAction] = useActionState<
    CheckoutActionState,
    FormData
  >(createOrderAction, INITIAL_SERVER_STATE);
  const router = useRouter();
  const [showLeaveToCartDialog, setShowLeaveToCartDialog] = useState(false);

  const {
    form,
    isValid,
    step,
    errors,
    showShippingErrors,
    handleChange,
    handleNext,
    handlePrev,
    handleStepperClick,
<<<<<<< HEAD
  } = useCheckoutForm({
    defaults: {
      firstName: defaultFirstName,
      lastName: defaultLastName,
      email: defaultEmail,
      phone: defaultPhone,
    },
  });

  const { shippingType, storeLocationId, pickupLocationId } = form;
  const [serverError, setServerError] = useState<string | undefined>(undefined);

=======
  } = useCheckoutForm();

  const { shippingType, storeLocationId, pickupLocationId } = form;

  // Error del servidor que queremos poder limpiar
  const [serverError, setServerError] = useState<string | undefined>(undefined);

  // Sincronizamos el último error que venga del serverAction
>>>>>>> b4c8f25 (feat(fase-6): pedidos con datos de envío en Prisma + vista demo de orders (#29))
  useEffect(() => {
    setServerError(serverState.error);
  }, [serverState.error]);

  const canShowNextButton =
    step === 1
      ? shippingType === "home" ||
        (shippingType === "store" && !!storeLocationId) ||
        (shippingType === "pickup" && !!pickupLocationId)
      : true;

  const errorRef = useRef<HTMLDivElement | null>(null);
  const stepHeadingRef = useRef<HTMLHeadingElement | null>(null);

  // Focus + scroll al banner de error del servidor
  useEffect(() => {
    if (serverError && errorRef.current) {
      errorRef.current.focus();
      errorRef.current.scrollIntoView({
        behavior: "smooth",
        block: "start",
      });
    }
  }, [serverError]);

  // Wrappers para limpiar error del servidor al interactuar
  function handleChangeWithClear<K extends keyof CheckoutFormState>(
    key: K,
    value: CheckoutFormState[K],
  ) {
    if (serverError) setServerError(undefined);
    handleChange(key, value);
  }

  function handleNextWithClear() {
    if (serverError) setServerError(undefined);
    handleNext();
  }

  function handlePrevWithClear() {
    if (serverError) setServerError(undefined);
    handlePrev();
  }

  function handleStepperClickWithClear(target: CheckoutStep) {
    if (serverError) setServerError(undefined);
    handleStepperClick(target);
  }

  function handleSubmit(event: FormEvent<HTMLFormElement>) {
    if (step < 3) {
      event.preventDefault();
      handleNextWithClear();
      return;
    }
<<<<<<< HEAD
=======
    // step === 3 → dejamos que el form haga submit al serverAction
>>>>>>> b4c8f25 (feat(fase-6): pedidos con datos de envío en Prisma + vista demo de orders (#29))
  }

  const isStep1 = step === 1;
  const isStep2 = step === 2;
  const isStep3 = step === 3;

  return (
    <div className="border">
      <CheckoutStepper
        currentStep={step}
        onStepClick={handleStepperClickWithClear}
      />

      <form
<<<<<<< HEAD
        className="rounded-xs bg-background p-4"
=======
        className="rounded-lb bg-background p-4"
>>>>>>> b4c8f25 (feat(fase-6): pedidos con datos de envío en Prisma + vista demo de orders (#29))
        action={formAction}
        noValidate
        onSubmit={handleSubmit}
      >
        {serverError && (
          <div
            ref={errorRef}
            tabIndex={-1}
<<<<<<< HEAD
            className="mb-3 rounded-xs border border-destructive/40 bg-destructive/10 px-3 py-2 text-sm text-destructive"
=======
            className="mb-3 rounded-lb border border-destructive/40 bg-destructive/10 px-3 py-2 text-sm text-destructive"
>>>>>>> b4c8f25 (feat(fase-6): pedidos con datos de envío en Prisma + vista demo de orders (#29))
            role="alert"
            aria-live="assertive"
          >
            {serverError}
          </div>
        )}

        <h2
          ref={stepHeadingRef}
          tabIndex={-1}
<<<<<<< HEAD
          className="pb-4 text-xl font-semibold text-foreground"
=======
          className="py-1 text-lg font-semibold text-foreground"
>>>>>>> b4c8f25 (feat(fase-6): pedidos con datos de envío en Prisma + vista demo de orders (#29))
        >
          {isStep1 && "Elige un método de envío"}
          {isStep2 && "Elige un método de pago"}
          {isStep3 && "Revisa y finaliza tu pedido"}
        </h2>

        {/* Mensaje global solo para lectores de pantalla cuando forzamos errores de envío */}
        <div className="sr-only" aria-live="polite">
          {showShippingErrors && step === 1
            ? "Hay errores en los datos de envío. Revisa los campos marcados en rojo."
            : ""}
        </div>

        {/* Paso 1: datos de envío */}
        {isStep1 && (
          <CheckoutShippingStep
            form={form}
            errors={errors}
            onChange={handleChangeWithClear}
          />
        )}

        {/* Paso 2: método de pago */}
        {isStep2 && (
          <CheckoutPaymentStep form={form} onChange={handleChangeWithClear} />
        )}

        {/* Paso 3: resumen final + inputs ocultos */}
<<<<<<< HEAD
        {isStep3 && (
          <CheckoutReviewStep
            form={form}
            onEditShipping={() => handleStepperClick(1)}
            onEditContact={() => handleStepperClick(1)}
            onEditPayment={() => handleStepperClick(2)}
          />
        )}

        {/* Navegación entre pasos */}
        <div className="flex flex-col gap-6 py-1 text-sm font-medium sm:flex-row sm:items-center sm:justify-between">
=======
        {isStep3 && <CheckoutReviewStep form={form} />}

        {/* Navegación entre pasos */}
        <div className="flex flex-col gap-3 py-1 text-sm font-medium sm:flex-row sm:items-center sm:justify-between">
>>>>>>> b4c8f25 (feat(fase-6): pedidos con datos de envío en Prisma + vista demo de orders (#29))
          <div>
            {step === 1 && (
              <button
                type="button"
<<<<<<< HEAD
                className="text-muted-foreground hover:cursor-pointer hover:text-primary transition-all duration-200 ease-in-out"
=======
                className="text-muted-foreground fx-underline-anim hover:cursor-pointer hover:text-primary transition-all duration-200 ease-in-out"
>>>>>>> b4c8f25 (feat(fase-6): pedidos con datos de envío en Prisma + vista demo de orders (#29))
                onClick={() => setShowLeaveToCartDialog(true)}
              >
                ← Volver a la cesta
              </button>
            )}
            {step > 1 && (
              <button
                type="button"
<<<<<<< HEAD
                className="text-muted-foreground transition-all duration-200 ease-in-out hover:cursor-pointer hover:text-primary"
=======
                className="fx-underline-anim text-muted-foreground transition-all duration-200 ease-in-out hover:cursor-pointer hover:text-primary"
>>>>>>> b4c8f25 (feat(fase-6): pedidos con datos de envío en Prisma + vista demo de orders (#29))
                onClick={handlePrevWithClear}
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
<<<<<<< HEAD
                className="w-full hover:cursor-pointer p-3 sm:py-2 sm:w-auto"
=======
                className="w-full hover:cursor-pointer sm:w-auto"
>>>>>>> b4c8f25 (feat(fase-6): pedidos con datos de envío en Prisma + vista demo de orders (#29))
                variant="default"
                onClick={handleNextWithClear}
              >
                {step === 1 ? "Guardar y continuar" : "Guardar y continuar"}
              </Button>
            )}

            {step === 3 && <SubmitButton disabledBase={!isValid} />}
          </div>
        </div>
      </form>
      <LeaveCheckoutDialog
        open={showLeaveToCartDialog}
        onClose={() => setShowLeaveToCartDialog(false)}
        onConfirm={() => {
          setShowLeaveToCartDialog(false);
          router.push("/cart");
        }}
        title="¿Volver a la cesta?"
        description="Si vuelves a la cesta, saldrás del proceso de compra. Podrás retomarlo más tarde desde tu carrito."
        confirmLabel="Volver a la cesta"
        cancelLabel="Continuar con la compra"
      />
    </div>
  );
}
