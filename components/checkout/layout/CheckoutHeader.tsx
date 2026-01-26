"use client";

import { useRouter } from "next/navigation";
import { useState } from "react";
import { FaArrowLeft } from "react-icons/fa6";

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
    router.push("/catalogo");
    setOpenDialog(false);
  };

  return (
    <>
      <header className="sticky top-0 z-[40] flex h-[var(--header-h)] w-full items-center border-b bg-background">
        <div className="mx-auto grid h-full w-full grid-cols-[1fr_auto_1fr] items-center px-4">
          <div className="flex justify-start">
            <Button
              variant="ghost"
              className="p-2 rounded-xs"
              onClick={() => setOpenDialog(true)}
            >
              <FaArrowLeft className="size-4" />
            </Button>
          </div>
          <div className="flex justify-center">
            <button
              type="button"
              className="flex items-center gap-2 text-xl font-bold hover:cursor-pointer"
              onClick={() => setOpenDialog(true)}
            >
              <span className="text-black">LSB</span>
            </button>
          </div>

          <div />
        </div>
      </header>

      <Dialog open={openDialog} onOpenChange={setOpenDialog}>
        <DialogContent className="sm:max-w-[425px]">
          <DialogHeader>
            <DialogTitle className="text-xl font-semibold">
              ¿Quieres salir del proceso?
            </DialogTitle>
            <DialogDescription className="text-muted-foreground pt-2 text-sm leading-relaxed">
              Estás a punto de salir del proceso de compra
            </DialogDescription>
          </DialogHeader>

          <DialogFooter className="flex flex-col-reverse gap-4 pt-2 justify-between">
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
              Ir a la tienda
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </>
  );
}
