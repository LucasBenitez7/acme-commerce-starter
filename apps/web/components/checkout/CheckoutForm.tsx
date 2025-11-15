"use client";
import { useEffect, useState, useRef, useActionState } from "react";
import { useFormStatus } from "react-dom";

import {
  CheckoutStepper,
  type CheckoutStep,
} from "@/components/checkout/CheckoutStepper";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";

import {
  createOrderAction,
  type CheckoutActionState,
} from "@/app/(site)/(shop)/checkout/actions";

type PaymentMethod = "card";

type FormState = {
  fullName: string;
  email: string;
  address: string;
  city: string;
  phone: string;
  paymentMethod: PaymentMethod;
};

const INITIAL_SERVER_STATE: CheckoutActionState = {
  error: undefined,
};

const STORAGE_KEY = "checkout.form.v1";

function isValidEmail(email: string): boolean {
  if (!email) return false;
  return /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email);
}

function isNonEmptyMin(text: string, min: number): boolean {
  return text.trim().length >= min;
}

function isValidPhone(phone: string): boolean {
  if (!phone) return true; // opcional
  return /^[0-9+\s()-]{6,20}$/.test(phone);
}

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

  const [form, setForm] = useState<FormState>({
    fullName: "",
    email: "",
    address: "",
    city: "",
    phone: "",
    paymentMethod: "card",
  });

  const [isValid, setIsValid] = useState(false);
  const [step, setStep] = useState<CheckoutStep>(1);
  const [maxStepReached, setMaxStepReached] = useState<CheckoutStep>(1);

  const errorRef = useRef<HTMLDivElement | null>(null);

  useEffect(() => {
    if (typeof window === "undefined") return;

    try {
      const raw = window.localStorage.getItem(STORAGE_KEY);
      if (!raw) return;

      const parsed = JSON.parse(raw) as Partial<FormState>;

      setForm((prev) => ({
        ...prev,
        fullName:
          typeof parsed.fullName === "string" ? parsed.fullName : prev.fullName,
        email: typeof parsed.email === "string" ? parsed.email : prev.email,
        address:
          typeof parsed.address === "string" ? parsed.address : prev.address,
        city: typeof parsed.city === "string" ? parsed.city : prev.city,
        phone: typeof parsed.phone === "string" ? parsed.phone : prev.phone,
        paymentMethod:
          parsed.paymentMethod === "card"
            ? parsed.paymentMethod
            : prev.paymentMethod,
      }));
    } catch {
      // ignoramos errores de parseo
    }
  }, []);

  // Guardar en localStorage cuando cambie el form
  useEffect(() => {
    if (typeof window === "undefined") return;

    try {
      window.localStorage.setItem(STORAGE_KEY, JSON.stringify(form));
    } catch {
      // ignoramos errores de almacenamiento
    }
  }, [form]);

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

  // Validación en cliente para el paso 1 (datos de envío)
  useEffect(() => {
    const valid =
      isNonEmptyMin(form.fullName, 3) &&
      isValidEmail(form.email) &&
      isNonEmptyMin(form.address, 5) &&
      isNonEmptyMin(form.city, 2) &&
      isValidPhone(form.phone);

    setIsValid(valid);
  }, [form]);

  function handleChange<K extends keyof FormState>(
    key: K,
    value: FormState[K],
  ) {
    setForm((prev) => ({
      ...prev,
      [key]: value,
    }));
  }

  function goToStep(target: CheckoutStep) {
    setStep(target);
  }

  function handleNext() {
    if (step === 1 && !isValid) {
      // No dejamos avanzar si los datos de envío no son válidos
      return;
    }

    const nextStep = (step + 1) as CheckoutStep;
    setStep(nextStep);
    setMaxStepReached((prev) => (nextStep > prev ? nextStep : prev));
  }

  function handlePrev() {
    if (step === 1) return;
    const prevStep = (step - 1) as CheckoutStep;
    setStep(prevStep);
  }

  function handleStepperClick(target: CheckoutStep) {
    if (target > maxStepReached) return;
    setStep(target);
  }

  const isStep1 = step === 1;
  const isStep2 = step === 2;
  const isStep3 = step === 3;

  const fullNameError =
    form.fullName !== "" && !isNonEmptyMin(form.fullName, 3);
  const emailError = form.email !== "" && !isValidEmail(form.email);
  const addressError = form.address !== "" && !isNonEmptyMin(form.address, 5);
  const cityError = form.city !== "" && !isNonEmptyMin(form.city, 2);
  const phoneError = form.phone !== "" && !isValidPhone(form.phone);

  return (
    <div className="space-y-4">
      {/* Stepper de pasos del checkout */}
      <CheckoutStepper
        currentStep={step}
        maxStepReached={maxStepReached}
        onStepClick={handleStepperClick}
      />

      <form className="space-y-6" action={formAction} noValidate>
        {serverState?.error && (
          <div
            ref={errorRef}
            tabIndex={-1}
            className="rounded-md border border-destructive/40 bg-destructive/10 px-3 py-2 text-sm text-destructive"
            role="alert"
          >
            {serverState.error}
          </div>
        )}

        {/* Paso 1: datos de envío */}
        {isStep1 && (
          <div className="space-y-4">
            <p className="text-sm font-medium text-muted-foreground">
              Paso 1 de 3 · Datos de envío
            </p>

            <div className="space-y-2">
              <Label htmlFor="fullName">Nombre completo</Label>
              <Input
                id="fullName"
                name="fullName"
                autoComplete="name"
                value={form.fullName}
                onChange={(e) => handleChange("fullName", e.target.value)}
                required
                aria-invalid={fullNameError || undefined}
                aria-describedby={fullNameError ? "fullName-error" : undefined}
              />
              {fullNameError && (
                <p id="fullName-error" className="text-xs text-destructive">
                  Introduce tu nombre y apellidos.
                </p>
              )}
            </div>

            <div className="space-y-2">
              <Label htmlFor="email">Correo electrónico</Label>
              <Input
                id="email"
                name="email"
                type="email"
                autoComplete="email"
                value={form.email}
                onChange={(e) => handleChange("email", e.target.value)}
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
              <Label htmlFor="address">Dirección</Label>
              <Input
                id="address"
                name="address"
                autoComplete="street-address"
                value={form.address}
                onChange={(e) => handleChange("address", e.target.value)}
                required
                aria-invalid={addressError || undefined}
                aria-describedby={addressError ? "address-error" : undefined}
              />
              {addressError && (
                <p id="address-error" className="text-xs text-destructive">
                  Introduce una dirección un poco más detallada.
                </p>
              )}
            </div>

            <div className="space-y-2">
              <Label htmlFor="city">Ciudad</Label>
              <Input
                id="city"
                name="city"
                autoComplete="address-level2"
                value={form.city}
                onChange={(e) => handleChange("city", e.target.value)}
                required
                aria-invalid={cityError || undefined}
                aria-describedby={cityError ? "city-error" : undefined}
              />
              {cityError && (
                <p id="city-error" className="text-xs text-destructive">
                  Introduce el nombre de tu ciudad.
                </p>
              )}
            </div>

            <div className="space-y-2">
              <Label htmlFor="phone">Teléfono (opcional)</Label>
              <Input
                id="phone"
                name="phone"
                type="tel"
                autoComplete="tel"
                value={form.phone}
                onChange={(e) => handleChange("phone", e.target.value)}
                aria-invalid={phoneError || undefined}
                aria-describedby={phoneError ? "phone-error" : undefined}
              />
              {phoneError && (
                <p id="phone-error" className="text-xs text-destructive">
                  El teléfono solo puede contener números y signos habituales
                  (+, espacios, guiones).
                </p>
              )}
            </div>
          </div>
        )}

        {/* Paso 2: método de pago */}
        {isStep2 && (
          <div className="space-y-4">
            <p className="text-sm font-medium text-muted-foreground">
              Paso 2 de 3 · Método de pago
            </p>

            <div className="space-y-3 rounded-lg border bg-muted/40 p-4 text-sm">
              <p className="font-medium">Pago online con tarjeta</p>
              <p className="text-xs text-muted-foreground">
                En el futuro conectaremos este paso con un proveedor de pagos
                (Stripe / Redsys). De momento, el pedido se crea en modo prueba.
              </p>
            </div>

            {/* Campo oculto para método de pago (preparando el futuro) */}
            <input
              type="hidden"
              name="paymentMethod"
              value={form.paymentMethod}
            />
          </div>
        )}

        {/* Paso 3: resumen final + inputs ocultos */}
        {isStep3 && (
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
                    <dd>{form.fullName || "—"}</dd>
                  </div>
                  <div className="flex gap-2">
                    <dt className="w-20 shrink-0 font-medium text-foreground">
                      Email
                    </dt>
                    <dd>{form.email || "—"}</dd>
                  </div>
                  <div className="flex gap-2">
                    <dt className="w-20 shrink-0 font-medium text-foreground">
                      Dirección
                    </dt>
                    <dd>{form.address || "—"}</dd>
                  </div>
                  <div className="flex gap-2">
                    <dt className="w-20 shrink-0 font-medium text-foreground">
                      Ciudad
                    </dt>
                    <dd>{form.city || "—"}</dd>
                  </div>
                  <div className="flex gap-2">
                    <dt className="w-20 shrink-0 font-medium text-foreground">
                      Teléfono
                    </dt>
                    <dd>{form.phone || "—"}</dd>
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
                <span className="font-medium">“Realizar pedido”</span> para
                crear el pedido de prueba.
              </p>
            </div>

            {/* Inputs ocultos para enviar los datos al servidor en el submit */}
            <input type="hidden" name="fullName" value={form.fullName} />
            <input type="hidden" name="email" value={form.email} />
            <input type="hidden" name="address" value={form.address} />
            <input type="hidden" name="city" value={form.city} />
            <input type="hidden" name="phone" value={form.phone} />
            <input
              type="hidden"
              name="paymentMethod"
              value={form.paymentMethod}
            />
          </div>
        )}

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
