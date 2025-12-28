"use client";

import { useRouter } from "next/navigation";
import { useState } from "react";
// import { FaChevronLeft } from "react-icons/fa6";

import { Button } from "@/components/ui/button";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";

export function CheckoutHeader() {
  const router = useRouter();
  const [openDialog, setOpenDialog] = useState(false);

  const handleGoHome = () => {
    router.push("/");
    setOpenDialog(false);
  };

  return (
    <>
      <header className="sticky top-0 z-[40] flex h-[var(--header-h)] w-full items-center border-b bg-background">
        <div className="mx-auto flex h-full w-full items-center border justify-center px-4 sm:px-6">
          <button
            type="button"
            className="flex items-center gap-2 text-xl font-bold hover:cursor-pointer"
            onClick={() => setOpenDialog(true)}
          >
            <span className="text-black">LSB</span>
          </button>
        </div>
      </header>

      <Dialog open={openDialog} onOpenChange={setOpenDialog}>
        <DialogContent className="sm:max-w-[425px]">
          <DialogHeader>
            <DialogTitle className="text-xl font-semibold">
              ¿Quieres cancelar el proceso?
            </DialogTitle>
            <DialogDescription className="text-muted-foreground pt-2 text-sm leading-relaxed">
              Estás a punto de salir del proceso de compra
            </DialogDescription>
          </DialogHeader>

          <DialogFooter className="flex flex-col-reverse gap-4 pt-2 justify-between">
            {/* Opción 1: Quedarse (Principal) */}
            <Button
              variant="outline"
              onClick={() => setOpenDialog(false)}
              className="font-semibold w-full sm:w-auto px-4 py-3 lg:flex-1"
            >
              Seguir comprando
            </Button>

            <Button
              variant="default"
              onClick={handleGoHome}
              className="font-semibold w-full sm:w-auto px-4 py-3 lg:flex-1"
            >
              Volver al inicio
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </>
  );
}
