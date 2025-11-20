"use client";
import { Fragment } from "react";

const STEPS = [
  { id: 1, label: "Envío" },
  { id: 2, label: "Método de pago" },
  { id: 3, label: "Resumen" },
] as const;

export type CheckoutStep = (typeof STEPS)[number]["id"];

type Props = {
  currentStep: CheckoutStep;
  onStepClick?: (step: CheckoutStep) => void;
};

export function CheckoutStepper({ currentStep, onStepClick }: Props) {
  return (
    <nav
      aria-label="Progreso del checkout"
      className="flex px-3 border-b py-4 text-xs sm:text-sm items-center justify-center bg-background"
    >
      <ol className="flex w-full items-center gap-3 sm:gap-4">
        {STEPS.map((step, index) => {
          const isCurrent = step.id === currentStep;
          const isPast = step.id < currentStep;
          const isFuture = step.id > currentStep;

          const canClick = !!onStepClick && isPast;

          const baseClasses =
            "flex items-center gap-2 rounded-lb font-medium px-2.5 py-1 transition-colors";
          const stateClasses = isCurrent
            ? "text-primary"
            : isPast
              ? "text-primary font-semibold"
              : "text-muted-foreground";

          return (
            <Fragment key={step.id}>
              <li className="flex flex-shrink-0 items-center gap-2">
                <button
                  type="button"
                  onClick={() => {
                    if (canClick) {
                      onStepClick(step.id);
                    }
                  }}
                  className={`${baseClasses} ${stateClasses} ${
                    canClick ? "cursor-pointer" : "cursor-default"
                  }`}
                  aria-current={isCurrent ? "step" : undefined}
                  aria-disabled={isFuture}
                >
                  <span
                    className={`inline-flex h-5 w-5 items-center justify-center  rounded-full border text-[0.7rem] font-semibold ${
                      isCurrent
                        ? "border-primary bg-primary text-background"
                        : "border-border"
                    } ${isPast ? "text-background bg-primary" : ""}`}
                  >
                    {isPast ? "✓" : step.id}
                  </span>
                  <span className="text-sm">{step.label}</span>
                </button>
              </li>
              {index < STEPS.length - 1 && (
                <li
                  aria-hidden="true"
                  className="hidden flex-1 items-center sm:flex"
                >
                  <span
                    className={`block h-px w-full ${
                      isPast ? "bg-primary" : "bg-border"
                    }`}
                  />
                </li>
              )}
            </Fragment>
          );
        })}
      </ol>
    </nav>
  );
}
