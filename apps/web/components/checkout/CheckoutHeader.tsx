"use client";

import { useRouter } from "next/navigation";
import { useState } from "react";

import { LeaveCheckoutDialog } from "@/components/checkout/LeaveCheckoutDialog";

export function CheckoutHeader() {
  const router = useRouter();
  const [openDialog, setOpenDialog] = useState(false);

  return (
    <>
      <header className="sticky top-0 z-[100] flex h-[var(--header-h)] w-full items-center border-b bg-background">
        <div className="mx-auto flex h-[var(--header-h)] w-max items-center px-4 sm:px-6">
          <button
            type="button"
            className="flex justify-self-center px-2 text-3xl font-semibold focus:outline-none hover:cursor-pointer"
            onClick={() => setOpenDialog(true)}
          >
            Logo lsb
          </button>
        </div>
      </header>

      <LeaveCheckoutDialog
        open={openDialog}
        onClose={() => setOpenDialog(false)}
        onConfirm={() => {
          setOpenDialog(false);
          router.push("/");
        }}
        title="¿Salir al inicio?"
        description="Si vas al inicio, saldrás del proceso de compra. Podrás volver desde tu cesta más adelante."
        confirmLabel="Ir al inicio"
        cancelLabel="Continuar con la compra"
      />
    </>
  );
}
