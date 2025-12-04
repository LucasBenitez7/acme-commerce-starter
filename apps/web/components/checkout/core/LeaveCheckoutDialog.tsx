"use client";

import { useEffect, useRef } from "react";

import { Button } from "@/components/ui";

type LeaveCheckoutDialogProps = {
  open: boolean;
  title?: string;
  description?: string;
  confirmLabel?: string;
  cancelLabel?: string;
  onConfirm: () => void;
  onClose: () => void;
};

export function LeaveCheckoutDialog({
  open,
  title = "¿Seguro que quieres salir del checkout?",
  description = "Si sales ahora, abandonarás el proceso de compra. Podrás volver más tarde desde tu cesta.",
  confirmLabel = "Salir del proceso de compra",
  cancelLabel = "Continuar comprando",
  onConfirm,
  onClose,
}: LeaveCheckoutDialogProps) {
  const dialogRef = useRef<HTMLDivElement | null>(null);

  // Cerrar con ESC
  useEffect(() => {
    if (!open) return;

    function handleKeyDown(event: KeyboardEvent) {
      if (event.key === "Escape") {
        event.preventDefault();
        onClose();
      }
    }

    window.addEventListener("keydown", handleKeyDown);
    return () => window.removeEventListener("keydown", handleKeyDown);
  }, [open, onClose]);

  // Enfocar el dialog al abrir
  useEffect(() => {
    if (open && dialogRef.current) {
      dialogRef.current.focus();
    }
  }, [open]);

  if (!open) return null;

  return (
    <div
      className="fixed inset-0 z-[999] flex items-center justify-center bg-black/40 px-4"
      onClick={(event) => {
        if (event.target === event.currentTarget) {
          onClose();
        }
      }}
    >
      <div
        ref={dialogRef}
        role="dialog"
        aria-modal="true"
        aria-labelledby="leave-checkout-title"
        aria-describedby="leave-checkout-description"
        tabIndex={-1}
<<<<<<< HEAD
        className="w-full max-w-sm rounded-xs border bg-background p-4 shadow-lg sm:p-5"
=======
        className="w-full max-w-sm rounded-lb border bg-background p-4 shadow-lg sm:p-5"
>>>>>>> b4c8f25 (feat(fase-6): pedidos con datos de envío en Prisma + vista demo de orders (#29))
      >
        <div className="space-y-2 text-center">
          <h2
            id="leave-checkout-title"
            className="text-base font-semibold text-foreground"
          >
            {title}
          </h2>
          <p
            id="leave-checkout-description"
            className="text-sm text-muted-foreground"
          >
            {description}
          </p>
        </div>

        <div className="mt-4 flex flex-col-reverse gap-2 sm:flex-row w-full">
          <Button
            type="button"
            variant="outline"
            className="w-full flex-1 sm:w-auto hover:cursor-pointer"
            onClick={onClose}
          >
            {cancelLabel}
          </Button>
          <Button
            type="button"
            variant="default"
            className="w-full flex-1 sm:w-auto hover:cursor-pointer"
            onClick={onConfirm}
          >
            {confirmLabel}
          </Button>
        </div>
      </div>
    </div>
  );
}
