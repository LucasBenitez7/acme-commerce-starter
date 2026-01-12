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
import {
  Select,
  SelectContent,
  SelectGroup,
  SelectItem,
  SelectLabel,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";

import { REJECTION_REASONS } from "@/lib/orders/constants";

import { updateOrderStatusAction, rejectReturnAction } from "../actions";

// --- BOTÓN DE CANCELAR PEDIDO ---
export function AdminCancelButton({ orderId }: { orderId: string }) {
  const [open, setOpen] = useState(false);
  const [loading, setLoading] = useState(false);

  const handleCancel = async () => {
    setLoading(true);
    const res = await updateOrderStatusAction(orderId, "CANCELLED");

    if (res?.error) {
      toast.error(res.error);
    } else {
      toast.success("Pedido cancelado y stock devuelto.");
      setOpen(false);
    }
    setLoading(false);
  };

  return (
    <Dialog open={open} onOpenChange={setOpen}>
      <DialogTrigger asChild>
        <Button variant="destructive" size="sm">
          Cancelar Pedido
        </Button>
      </DialogTrigger>
      <DialogContent>
        <DialogHeader>
          <DialogTitle>¿Confirmar Cancelación?</DialogTitle>
          <DialogDescription>
            El pedido pasará a estado <strong>CANCELADO</strong> y el stock se
            devolverá automáticamente al inventario. Esta acción no se puede
            deshacer fácilmente.
          </DialogDescription>
        </DialogHeader>
        <DialogFooter>
          <Button
            variant="outline"
            onClick={() => setOpen(false)}
            disabled={loading}
          >
            Atrás
          </Button>
          <Button
            variant="destructive"
            onClick={handleCancel}
            disabled={loading}
          >
            {loading ? "Cancelando..." : "Confirmar Cancelación"}
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}

// --- BOTÓN DE MARCAR COMO PAGADO ---
export function AdminPayButton({ orderId }: { orderId: string }) {
  const [open, setOpen] = useState(false);
  const [loading, setLoading] = useState(false);

  const handlePay = async () => {
    setLoading(true);
    // Llamamos a la server action con estado PAID
    const res = await updateOrderStatusAction(orderId, "PAID");

    if (res?.error) {
      toast.error(res.error);
    } else {
      toast.success("El pedido ha sido marcado como PAGADO.");
      setOpen(false);
    }
    setLoading(false);
  };

  return (
    <Dialog open={open} onOpenChange={setOpen}>
      <DialogTrigger asChild>
        {/* Quitamos el onClick={handlePay} de aquí para que solo abra el diálogo */}
        <Button
          size="sm"
          className="bg-green-600 hover:bg-green-700 text-white"
        >
          Marcar Pagado
        </Button>
      </DialogTrigger>
      <DialogContent>
        <DialogHeader>
          <DialogTitle>¿Confirmar Pago?</DialogTitle>
          <DialogDescription>
            El pedido pasará a estado <strong>PAGADO</strong>.
            <br />
            Asegúrate de haber verificado correctamente
          </DialogDescription>
        </DialogHeader>
        <DialogFooter>
          <Button
            variant="outline"
            onClick={() => setOpen(false)}
            disabled={loading}
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

// --- BOTÓN DE RECHAZAR DEVOLUCIÓN ---
export function AdminRejectButton({ orderId }: { orderId: string }) {
  const [open, setOpen] = useState(false);
  const [loading, setLoading] = useState(false);
  const [selectedReason, setSelectedReason] = useState("");
  const [customReason, setCustomReason] = useState("");

  const handleReject = async () => {
    const finalReason =
      selectedReason === "Otro motivo" ? customReason : selectedReason;

    if (!finalReason) {
      toast.error("Debes seleccionar o escribir un motivo.");
      return;
    }

    setLoading(true);
    const res = await rejectReturnAction(orderId, finalReason);

    if (res?.error) {
      toast.error(res.error);
    } else {
      toast.success("Devolución rechazada. El pedido sigue como PAGADO.");
      setOpen(false);
      setSelectedReason("");
      setCustomReason("");
    }
    setLoading(false);
  };

  return (
    <Dialog open={open} onOpenChange={setOpen}>
      <DialogTrigger asChild>
        <Button variant="destructive" size="sm">
          Rechazar Devolución
        </Button>
      </DialogTrigger>
      <DialogContent>
        <DialogHeader>
          <DialogTitle>Rechazar Devolución</DialogTitle>
          <DialogDescription>
            El pedido volverá al estado <strong>PAGADO</strong>. Explica al
            cliente por qué no se acepta la devolución.
          </DialogDescription>
        </DialogHeader>
        <div className="py-4 space-y-3">
          <label className="text-sm font-medium">Motivo del rechazo</label>
          <Select value={selectedReason} onValueChange={setSelectedReason}>
            <SelectTrigger className="w-full hover:cursor-pointer text-foreground font-medium">
              <SelectValue
                placeholder="-- Selecciona --"
                className="placeholder:text-foreground text-foreground font-medium"
              />
            </SelectTrigger>
            <SelectContent className="font-medium">
              {REJECTION_REASONS.map((r) => (
                <SelectItem
                  key={r}
                  value={r}
                  className="hover:cursor-pointer rounded-xs"
                >
                  {r}
                </SelectItem>
              ))}
            </SelectContent>
          </Select>
          {selectedReason === "Otro motivo" && (
            <textarea
              className="w-full border rounded-xs p-2 text-sm bg-background flex min-h-[200px]  resize-none"
              placeholder="Escribe los detalles aquí..."
              rows={3}
              value={customReason}
              onChange={(e) => setCustomReason(e.target.value)}
            />
          )}
        </div>
        <DialogFooter>
          <Button
            variant="outline"
            onClick={() => setOpen(false)}
            disabled={loading}
          >
            Cancelar
          </Button>
          <Button
            onClick={handleReject}
            disabled={loading || !selectedReason}
            variant="destructive"
          >
            {loading ? "..." : "Confirmar Rechazo"}
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}
