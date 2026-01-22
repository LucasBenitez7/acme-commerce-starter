"use client";

import { useState } from "react";
import { toast } from "sonner";

import { Button } from "@/components/ui/button";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
  DialogFooter,
  DialogDescription,
} from "@/components/ui/dialog";

import { updatePaymentStatusAction } from "@/app/(admin)/admin/orders/actions";

export function MarkPaidButton({ orderId }: { orderId: string }) {
  const [open, setOpen] = useState(false);
  const [loading, setLoading] = useState(false);

  const handlePay = async () => {
    setLoading(true);
    const res = await updatePaymentStatusAction(orderId, "PAID");

    if (res?.error) {
      toast.error(res.error);
    } else {
      toast.success("Pago confirmado correctamente");
      setOpen(false);
    }
    setLoading(false);
  };

  return (
    <Dialog open={open} onOpenChange={setOpen}>
      <DialogTrigger asChild>
        <Button className="bg-green-600 hover:bg-green-700 text-white w-full sm:w-fit">
          Marcar Pagado
        </Button>
      </DialogTrigger>
      <DialogContent>
        <DialogHeader>
          <DialogTitle>¿Confirmar Pago?</DialogTitle>
          <DialogDescription className="text-foreground py-2">
            El pedido se marcará como <strong>PAGADO</strong>. Asegúrate de
            haber recibido el dinero.
          </DialogDescription>
        </DialogHeader>
        <DialogFooter className="gap-2 sm:justify-end">
          <Button
            variant="outline"
            onClick={() => setOpen(false)}
            className="w-full sm:w-fit"
          >
            Cancelar
          </Button>
          <Button
            onClick={handlePay}
            disabled={loading}
            className="bg-green-600 hover:bg-green-700 text-white"
          >
            {loading ? "Procesando..." : "Confirmar Pago"}
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}
