"use client";

const STEPS = [
  { id: 1, label: "Envío" },
  { id: 2, label: "Método de pago" },
  { id: 3, label: "Resumen" },
] as const;

export type CheckoutStep = (typeof STEPS)[number]["id"];

type Props = {
  currentStep: CheckoutStep;
  maxStepReached: CheckoutStep;
  onStepClick?: (step: CheckoutStep) => void;
};

export function CheckoutStepper({
  currentStep,
  maxStepReached,
  onStepClick,
}: Props) {
  return (
    <nav
      aria-label="Progreso del checkout"
      className="mb-4 rounded-lg border bg-muted/60 px-3 py-2.5 text-xs sm:text-sm"
    >
      <ol className="flex items-center gap-3 sm:gap-4">
        {STEPS.map((step, index) => {
          const isCurrent = step.id === currentStep;
          const isCompleted = step.id < currentStep;
          const isDisabled = step.id > maxStepReached;

          const baseClasses =
            "flex items-center gap-2 rounded-full px-2.5 py-1 transition-colors";
          const stateClasses = isCurrent
            ? "bg-primary text-primary-foreground"
            : isCompleted
              ? "bg-primary/10 text-primary"
              : "bg-muted text-muted-foreground";

          return (
            <li key={step.id} className="flex items-center gap-2">
              <button
                type="button"
                disabled={isDisabled}
                onClick={() => {
                  if (onStepClick && !isDisabled) {
                    onStepClick(step.id);
                  }
                }}
                className={`${baseClasses} ${
                  isDisabled
                    ? "cursor-default opacity-50"
                    : "hover:bg-primary/15"
                } ${stateClasses}`}
                aria-current={isCurrent ? "step" : undefined}
                aria-disabled={isDisabled}
              >
                <span className="inline-flex h-5 w-5 items-center justify-center rounded-full border text-[0.7rem] font-semibold">
                  {isCompleted ? "✓" : step.id}
                </span>
                <span className="font-medium">{step.label}</span>
              </button>

              {index < STEPS.length - 1 && (
                <span
                  aria-hidden="true"
                  className="hidden h-px w-6 shrink-0 bg-border sm:block"
                />
              )}
            </li>
          );
        })}
      </ol>
    </nav>
  );
}
