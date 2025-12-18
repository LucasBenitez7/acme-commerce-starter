"use client";

import { useState } from "react";
import { FaBan, FaRotateLeft, FaClock } from "react-icons/fa6";
import { toast } from "sonner";

import { Button } from "@/components/ui/button";
import { Checkbox } from "@/components/ui/checkbox";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
  DialogFooter,
  DialogDescription,
} from "@/components/ui/dialog";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Textarea } from "@/components/ui/textarea";

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
  quantityReturnRequested?: number; // Asegúrate de que Prisma traiga esto si existe
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

  // Mapa: itemId -> cantidad a devolver
  const [returnMap, setReturnMap] = useState<Record<string, number>>({});

  // --- 1. CANCELAR PEDIDO ---
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

  // --- 2. GESTIÓN DE SELECCIÓN ---
  const handleToggleItem = (itemId: string, max: number, checked: boolean) => {
    setReturnMap((prev) => {
      const next = { ...prev };
      if (checked) {
        next[itemId] = max; // Seleccionar todo por defecto
      } else {
        delete next[itemId];
      }
      return next;
    });
  };

  const handleQtyChange = (itemId: string, val: string, max: number) => {
    const num = parseInt(val) || 0;
    // Si pone 0 o negativo, lo quitamos del mapa (desmarcar)
    if (num <= 0) {
      const next = { ...returnMap };
      delete next[itemId];
      setReturnMap(next);
      return;
    }
    setReturnMap((prev) => ({ ...prev, [itemId]: Math.min(num, max) }));
  };

  // --- 3. ENVIAR DEVOLUCIÓN ---
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

    if (res?.error) {
      toast.error(res.error);
    } else {
      toast.success("Solicitud enviada. Recibirás instrucciones pronto.");
      setOpenReturn(false);
      // Limpiar estado
      setReturnMap({});
      setSelectedReason("");
      setCustomReason("");
    }
    setLoading(false);
  };

  // --- RENDERIZADO CONDICIONAL ---

  // CASO A: PENDIENTE (Cancelar)
  if (status === "PENDING_PAYMENT") {
    return (
      <Dialog open={openCancel} onOpenChange={setOpenCancel}>
        <DialogTrigger asChild>
          <Button
            variant="outline"
            size="sm"
            className="w-full border-red-200 text-red-600 hover:bg-red-50 hover:text-red-700"
          >
            <FaBan className="mr-2 h-3 w-3" />
            Cancelar Pedido
          </Button>
        </DialogTrigger>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>¿Cancelar este pedido?</DialogTitle>
            <DialogDescription>
              Esta acción es irreversible. El stock será liberado
              inmediatamente.
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

  // CASO B: PAGADO (Devolver)
  if (status === "PAID") {
    // Calculamos qué se puede devolver (Item total - (devuelto + solicitado))
    const returnableItems = items.filter((i) => {
      // Asumimos que Prisma trae estos campos. Si no, pon 0 por defecto.
      const returned = i.quantityReturned || 0;
      const requested = i.quantityReturnRequested || 0;
      return i.quantity - returned - requested > 0;
    });

    if (returnableItems.length === 0) return null; // Nada que devolver

    return (
      <Dialog open={openReturn} onOpenChange={setOpenReturn}>
        <DialogTrigger asChild>
          <Button variant="outline" size="sm" className="w-full">
            <FaRotateLeft className="mr-2 h-3 w-3" />
            Solicitar Devolución
          </Button>
        </DialogTrigger>
        <DialogContent className="max-w-md">
          <DialogHeader>
            <DialogTitle>Solicitar Devolución</DialogTitle>
            <DialogDescription>
              Selecciona los productos y el motivo.
            </DialogDescription>
          </DialogHeader>

          <div className="space-y-6 py-2">
            {/* LISTA DE PRODUCTOS */}
            <div className="space-y-3">
              <Label>Productos a devolver</Label>
              <div className="max-h-[200px] overflow-y-auto pr-2 space-y-2">
                {returnableItems.map((item) => {
                  const max =
                    item.quantity -
                    (item.quantityReturned || 0) -
                    (item.quantityReturnRequested || 0);
                  const isSelected = (returnMap[item.id] || 0) > 0;

                  return (
                    <div
                      key={item.id}
                      className={`flex items-center gap-3 border p-3 rounded-md transition-colors ${
                        isSelected
                          ? "border-neutral-800 bg-neutral-50"
                          : "border-neutral-200"
                      }`}
                    >
                      <Checkbox
                        checked={isSelected}
                        onCheckedChange={(c) =>
                          handleToggleItem(item.id, max, c as boolean)
                        }
                      />
                      <div className="flex-1 text-sm">
                        <p className="font-medium truncate">
                          {item.nameSnapshot}
                        </p>
                        {(item.sizeSnapshot || item.colorSnapshot) && (
                          <p className="text-xs text-muted-foreground">
                            {item.sizeSnapshot}{" "}
                            {item.colorSnapshot
                              ? `/ ${item.colorSnapshot}`
                              : ""}
                          </p>
                        )}
                      </div>

                      {isSelected && (
                        <div className="flex items-center gap-2">
                          <Input
                            type="number"
                            min={1}
                            max={max}
                            className="w-14 h-8 text-right px-2"
                            value={returnMap[item.id] || ""}
                            onChange={(e) =>
                              handleQtyChange(item.id, e.target.value, max)
                            }
                          />
                          <span className="text-xs text-muted-foreground">
                            / {max}
                          </span>
                        </div>
                      )}
                    </div>
                  );
                })}
              </div>
            </div>

            {/* SELECTOR DE MOTIVO (SHADCN UI) */}
            <div className="space-y-3">
              <Label>Motivo de la devolución</Label>
              <Select value={selectedReason} onValueChange={setSelectedReason}>
                <SelectTrigger>
                  <SelectValue placeholder="Selecciona un motivo" />
                </SelectTrigger>
                <SelectContent>
                  {RETURN_REASONS.map((r) => (
                    <SelectItem key={r} value={r}>
                      {r}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>

              {selectedReason === "Otro motivo" && (
                <Textarea
                  placeholder="Explícanos brevemente el problema..."
                  value={customReason}
                  onChange={(e) => setCustomReason(e.target.value)}
                  className="min-h-[80px]"
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
              className="w-full sm:w-auto"
            >
              {loading ? "Enviando..." : "Enviar Solicitud"}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    );
  }

  // CASO C: YA SOLICITADO (Feedback)
  if (status === "RETURN_REQUESTED") {
    return (
      <Button
        variant="secondary"
        size="sm"
        disabled
        className="w-full opacity-100 cursor-default bg-orange-100 text-orange-800 hover:bg-orange-100 border border-orange-200"
      >
        <FaClock className="mr-2 h-3 w-3" />
        Devolución en proceso
      </Button>
    );
  }

  return null;
}
