"use client";

import { useState } from "react";
import { FaBan, FaRotateLeft, FaClock } from "react-icons/fa6";
import { toast } from "sonner";

import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
  DialogFooter,
  DialogDescription,
  Button,
  Input,
} from "@/components/ui";
import { Checkbox } from "@/components/ui/checkbox";

import { RETURN_REASONS } from "@/lib/constants";

import {
  cancelOrderUserAction,
  requestReturnUserAction,
} from "@/app/(site)/(account)/account/orders/actions";

type OrderItem = {
  id: string;
  nameSnapshot: string;
  sizeSnapshot: string | null;
  colorSnapshot: string | null;
  quantity: number;
  quantityReturned: number;
};

type Props = {
  orderId: string;
  status: string;
  items: OrderItem[];
};

export function UserOrderActions({ orderId, status, items }: Props) {
  const [openReturn, setOpenReturn] = useState(false);
  const [openCancel, setOpenCancel] = useState(false);
  const [loading, setLoading] = useState(false);
  const [selectedReason, setSelectedReason] = useState("");
  const [customReason, setCustomReason] = useState("");
  const [returnMap, setReturnMap] = useState<Record<string, number>>({});

  // --- LÓGICA CANCELAR ---
  const handleCancel = async () => {
    setLoading(true);
    const res = await cancelOrderUserAction(orderId);
    if (res.error) {
      toast.error(res.error);
    } else {
      toast.success("Pedido cancelado correctamente.");
      setOpenCancel(false);
    }
    setLoading(false);
  };

  // Lógica Selección Cantidad
  const handleToggleItem = (itemId: string, max: number, checked: boolean) => {
    setReturnMap((prev) => {
      const next = { ...prev };
      if (checked) next[itemId] = max;
      else delete next[itemId];
      return next;
    });
  };

  const handleQtyChange = (itemId: string, val: string, max: number) => {
    const num = parseInt(val) || 0;
    setReturnMap((prev) => ({ ...prev, [itemId]: Math.min(num, max) }));
  };

  // Lógica Enviar Solicitud
  const handleRequestReturn = async () => {
    const finalReason =
      selectedReason === "Otro motivo" ? customReason : selectedReason;
    if (!finalReason.trim()) return toast.error("Indica un motivo");

    const itemsPayload = Object.entries(returnMap)
      .filter(([_, qty]) => qty > 0)
      .map(([itemId, qty]) => ({ itemId, qty }));

    if (itemsPayload.length === 0)
      return toast.error("Selecciona qué productos devolver");

    setLoading(true);
    const res = await requestReturnUserAction(
      orderId,
      finalReason,
      itemsPayload,
    );

    if (res.error) toast.error(res.error);
    else {
      toast.success("Solicitud enviada correctamente.");
      setOpenReturn(false);
    }
    setLoading(false);
  };

  // 1. CASO PENDIENTE: Botón Cancelar con Confirmación
  if (status === "PENDING_PAYMENT") {
    return (
      <Dialog open={openCancel} onOpenChange={setOpenCancel}>
        <DialogTrigger asChild>
          <Button
            variant="outline"
            size="sm"
            className="w-full border-red-200 text-red-600 hover:bg-red-50"
          >
            <FaBan className="mr-2 h-3 w-3" />
            Cancelar Pedido
          </Button>
        </DialogTrigger>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>¿Cancelar este pedido?</DialogTitle>
            <DialogDescription>
              Esta acción no se puede deshacer. Si ya has realizado el pago, por
              favor contáctanos.
            </DialogDescription>
          </DialogHeader>
          <DialogFooter className="gap-2 sm:gap-0">
            <Button variant="ghost" onClick={() => setOpenCancel(false)}>
              Volver
            </Button>
            <Button
              variant="destructive"
              onClick={handleCancel}
              disabled={loading}
            >
              {loading ? "Cancelando..." : "Sí, Cancelar Pedido"}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    );
  }

  // 2. CASO PAGADO: Botón Devolver con Selección
  if (status === "PAID") {
    const returnableItems = items.filter(
      (i) => i.quantity - i.quantityReturned > 0,
    );
    if (returnableItems.length === 0) return null;

    return (
      <Dialog open={openReturn} onOpenChange={setOpenReturn}>
        <DialogTrigger asChild>
          <Button variant="outline" size="sm" className="w-full">
            <FaRotateLeft className="mr-2 h-3 w-3" />
            Solicitar Devolución
          </Button>
        </DialogTrigger>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Solicitar Devolución</DialogTitle>
            <DialogDescription>
              Selecciona el motivo principal.
            </DialogDescription>
          </DialogHeader>

          <div className="space-y-6 py-2">
            {/* Selección de Items */}
            <div className="space-y-3">
              <p className="text-sm font-medium">
                ¿Qué productos quieres devolver?
              </p>
              {returnableItems.map((item) => {
                const max = item.quantity - item.quantityReturned;
                const isSelected = (returnMap[item.id] || 0) > 0;
                return (
                  <div
                    key={item.id}
                    className={`flex items-center gap-3 border p-3 rounded-xs transition-colors ${isSelected ? "border-black bg-neutral-50" : "border-neutral-200"}`}
                  >
                    <Checkbox
                      checked={isSelected}
                      onCheckedChange={(c) =>
                        handleToggleItem(item.id, max, c as boolean)
                      }
                    />
                    <div className="flex-1 text-sm">
                      <p className="font-medium">{item.nameSnapshot}</p>
                      <p className="text-xs text-muted-foreground">
                        {item.sizeSnapshot} / {item.colorSnapshot}
                      </p>
                    </div>
                    {isSelected && (
                      <div className="flex items-center gap-2">
                        <Input
                          type="number"
                          min={1}
                          max={max}
                          className="w-16 h-8 text-right"
                          value={returnMap[item.id] || ""}
                          onChange={(e) =>
                            handleQtyChange(item.id, e.target.value, max)
                          }
                        />
                        <span className="text-xs">/ {max}</span>
                      </div>
                    )}
                  </div>
                );
              })}
            </div>

            {/* Motivo */}
            <div className="space-y-2">
              <label className="text-sm font-medium">Motivo</label>
              <select
                className="w-full rounded-xs border p-2 text-sm"
                value={selectedReason}
                onChange={(e) => setSelectedReason(e.target.value)}
              >
                <option value="">-- Selecciona --</option>
                {RETURN_REASONS.map((r) => (
                  <option key={r} value={r}>
                    {r}
                  </option>
                ))}
              </select>
              {selectedReason === "Otro motivo" && (
                <textarea
                  className="w-full border rounded p-2 text-sm"
                  placeholder="Cuéntanos más..."
                  value={customReason}
                  onChange={(e) => setCustomReason(e.target.value)}
                />
              )}
            </div>
          </div>

          <DialogFooter>
            <Button
              onClick={handleRequestReturn}
              disabled={
                loading ||
                !selectedReason ||
                Object.keys(returnMap).length === 0
              }
            >
              {loading ? "Enviando..." : "Enviar Solicitud"}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    );
  }

  // 3. SOLICITADO (Feedback visual)
  if (status === "RETURN_REQUESTED") {
    return (
      <Button
        variant="secondary"
        size="sm"
        disabled
        className="w-full opacity-100 cursor-default bg-orange-100 text-orange-800 hover:bg-orange-100"
      >
        <FaClock className="mr-2 h-3 w-3" />
        Devolución en proceso
      </Button>
    );
  }

  return null;
}
