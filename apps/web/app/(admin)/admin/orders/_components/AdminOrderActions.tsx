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

import { REJECTION_REASONS } from "@/lib/constants";

import { updateOrderStatusAction, rejectReturnAction } from "../actions";

export function AdminCancelButton({ orderId }: { orderId: string }) {
  const [open, setOpen] = useState(false);
  const [loading, setLoading] = useState(false);

  const handleCancel = async () => {
    setLoading(true);
    const res = await updateOrderStatusAction(orderId, "CANCELLED");
    if (res.error) toast.error(res.error);
    else {
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
            El pedido pasará a estado CANCELADO y el stock se devolverá
            automáticamente al inventario.
          </DialogDescription>
        </DialogHeader>
        <DialogFooter>
          <Button variant="outline" onClick={() => setOpen(false)}>
            Atrás
          </Button>
          <Button
            variant="destructive"
            onClick={handleCancel}
            disabled={loading}
          >
            {loading ? "Cancelando..." : "Confirmar"}
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}

export function AdminPayButton({ orderId }: { orderId: string }) {
  const [loading, setLoading] = useState(false);
  const handlePay = async () => {
    setLoading(true);
    await updateOrderStatusAction(orderId, "PAID");
    setLoading(false);
  };
  return (
    <Button
      onClick={handlePay}
      disabled={loading}
      size="sm"
      className="bg-green-600 hover:bg-green-700"
    >
      {loading ? "..." : "Marcar Pagado"}
    </Button>
  );
}

export function AdminRejectButton({ orderId }: { orderId: string }) {
  const [open, setOpen] = useState(false);
  const [loading, setLoading] = useState(false);
  const [selectedReason, setSelectedReason] = useState("");
  const [customReason, setCustomReason] = useState("");

  const handleReject = async () => {
    const finalReason =
      selectedReason === "Otro motivo" ? customReason : selectedReason;
    if (!finalReason) return;

    setLoading(true);
    const res = await rejectReturnAction(orderId, finalReason);
    if (res.error) toast.error(res.error);
    else {
      toast.success("Devolución rechazada. El pedido sigue como PAGADO.");
      setOpen(false);
    }
    setLoading(false);
  };

  return (
    <Dialog open={open} onOpenChange={setOpen}>
      <DialogTrigger asChild>
        <Button variant="destructive" size="sm">
          Rechazar Solicitud
        </Button>
      </DialogTrigger>
      <DialogContent>
        <DialogHeader>
          <DialogTitle>Rechazar Devolución</DialogTitle>
          <DialogDescription>
            El pedido volverá al estado PAGADO. Explica al cliente por qué no se
            acepta.
          </DialogDescription>
        </DialogHeader>
        <div className="py-4 space-y-3">
          <label className="text-sm font-medium">Motivo del rechazo</label>
          <select
            className="w-full rounded-xs border p-2 text-sm"
            value={selectedReason}
            onChange={(e) => setSelectedReason(e.target.value)}
          >
            <option value="">-- Selecciona --</option>
            {REJECTION_REASONS.map((r) => (
              <option key={r} value={r}>
                {r}
              </option>
            ))}
          </select>

          {selectedReason === "Otro motivo" && (
            <textarea
              className="w-full border rounded p-2 text-sm"
              placeholder="Detalles..."
              value={customReason}
              onChange={(e) => setCustomReason(e.target.value)}
            />
          )}
        </div>
        <DialogFooter>
          <Button variant="outline" onClick={() => setOpen(false)}>
            Cancelar
          </Button>
          <Button onClick={handleReject} disabled={loading || !selectedReason}>
            {loading ? "..." : "Confirmar Rechazo"}
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}
