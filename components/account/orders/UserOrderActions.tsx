"use client";

import Link from "next/link";
import { useState } from "react";
import { FaBan, FaRotateLeft, FaCreditCard } from "react-icons/fa6"; // <--- Importamos FaCreditCard
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

import { cancelOrderUserAction } from "@/app/(site)/(account)/account/orders/actions";

import type { PaymentStatus, FulfillmentStatus } from "@prisma/client";

type Props = {
  orderId: string;
  paymentStatus: PaymentStatus;
  fulfillmentStatus: FulfillmentStatus;
  isCancelled: boolean;
  className?: string;
};

export function UserOrderActions({
  orderId,
  paymentStatus,
  fulfillmentStatus,
  isCancelled,
  className,
}: Props) {
  if (isCancelled) return null;

  const [openCancel, setOpenCancel] = useState(false);
  const [loading, setLoading] = useState(false);

  const handleCancel = async () => {
    setLoading(true);
    const res = await cancelOrderUserAction(orderId);

    if (res?.error) {
      toast.error(res.error);
    } else {
      toast.success("Pedido cancelado correctamente.");
      setOpenCancel(false);
    }
    setLoading(false);
  };

  // --- LÓGICA DE VISIBILIDAD ---
  const isPendingAndUnfulfilled =
    paymentStatus === "PENDING" && fulfillmentStatus === "UNFULFILLED";

  const canReturn =
    paymentStatus === "PAID" && fulfillmentStatus === "DELIVERED";

  if (isPendingAndUnfulfilled) {
    return (
      <div
        className={`flex w-full flex-col sm:flex-row items-center justify-end gap-2 ${className || ""}`}
      >
        <Button asChild variant={"default"} className="w-full sm:w-fit">
          <Link href={""}>
            <FaCreditCard className="size-3.5" />
            Pagar Ahora
          </Link>
        </Button>

        <Dialog open={openCancel} onOpenChange={setOpenCancel}>
          <DialogTrigger asChild>
            <Button variant="destructive" className="w-full sm:w-fit">
              <FaBan className="size-3.5" />
              Cancelar
            </Button>
          </DialogTrigger>
          <DialogContent>
            <DialogHeader>
              <DialogTitle>¿Cancelar este pedido?</DialogTitle>
              <DialogDescription className="py-2">
                Al no haber realizado el pago aún, el pedido se cancelará
                inmediatamente y no se te cobrará nada.
              </DialogDescription>
            </DialogHeader>
            <DialogFooter className="gap-2 sm:justify-end">
              <Button variant="outline" onClick={() => setOpenCancel(false)}>
                No, mantener pedido
              </Button>
              <Button
                variant="destructive"
                onClick={handleCancel}
                disabled={loading}
              >
                {loading ? "Procesando..." : "Sí, Cancelar Pedido"}
              </Button>
            </DialogFooter>
          </DialogContent>
        </Dialog>
      </div>
    );
  }

  if (canReturn) {
    return (
      <Button asChild variant="default" className="w-full sm:w-fit">
        <Link href={`/account/orders/${orderId}/return`}>
          <FaRotateLeft className="size-3.5" />
          Solicitar Devolución
        </Link>
      </Button>
    );
  }

  return null;
}
