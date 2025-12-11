"use client";
import { useRouter } from "next/navigation";
import { useState, useEffect, useMemo } from "react";
import { FaTriangleExclamation } from "react-icons/fa6";
import { toast } from "sonner";

import { Button, Input } from "@/components/ui";
import { Card, CardContent } from "@/components/ui/card";
import { Checkbox } from "@/components/ui/checkbox";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";

import { REJECTION_REASONS } from "@/lib/constants";

import { processPartialReturnAction } from "@/app/(admin)/admin/orders/actions";

type OrderItem = {
  id: string;
  nameSnapshot: string;
  sizeSnapshot: string | null;
  colorSnapshot: string | null;
  quantity: number;
  quantityReturned: number;
  quantityReturnRequested: number;
};

export function ReturnForm({
  orderId,
  items,
}: {
  orderId: string;
  items: OrderItem[];
}) {
  const router = useRouter();
  const [loading, setLoading] = useState(false);

  const [returnMap, setReturnMap] = useState<Record<string, number>>({});

  const [rejectionReason, setRejectionReason] = useState("");
  const [customRejection, setCustomRejection] = useState("");

  useEffect(() => {
    const initialMap: Record<string, number> = {};
    items.forEach((item) => {
      if (item.quantityReturnRequested > 0) {
        initialMap[item.id] = item.quantityReturnRequested;
      }
    });
    setReturnMap(initialMap);
  }, [items]);

  const totalRequestedQty = useMemo(
    () => items.reduce((acc, i) => acc + i.quantityReturnRequested, 0),
    [items],
  );

  const totalAcceptedQty = useMemo(
    () => Object.values(returnMap).reduce((acc, qty) => acc + qty, 0),
    [returnMap],
  );

  const isPartialRejection =
    totalRequestedQty > 0 && totalAcceptedQty < totalRequestedQty;

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
    if (num < 0) return;
    if (num > max) return;
    setReturnMap((prev) => ({ ...prev, [itemId]: num }));
  };

  const handleSubmit = async () => {
    let finalRejectionNote = undefined;

    if (isPartialRejection) {
      if (!rejectionReason) {
        toast.error(
          "Debes indicar un motivo de rechazo para los artículos no aceptados.",
        );
        return;
      }
      finalRejectionNote =
        rejectionReason === "Otro motivo" ? customRejection : rejectionReason;

      if (rejectionReason === "Otro motivo" && !customRejection.trim()) {
        toast.error("Escribe el motivo del rechazo.");
        return;
      }
    }

    setLoading(true);
    const payload = Object.entries(returnMap)
      .filter(([_, qty]) => qty > 0)
      .map(([itemId, qty]) => ({ itemId, qtyToReturn: qty }));

    const res = await processPartialReturnAction(
      orderId,
      payload,
      finalRejectionNote,
    );

    if (res.error) {
      toast.error(res.error);
      setLoading(false);
    } else {
      toast.success("Devolución procesada correctamente");
      router.push(`/admin/orders/${orderId}`);
      router.refresh();
    }
  };

  return (
    <div className="space-y-4">
      <p className="text-foreground font-semibold text-xl">
        Gestionar Devolución
      </p>
      {totalRequestedQty > 0 && (
        <Card className="bg-background p-4 text-sm flex flex-col items-start gap-2 shadow-none">
          <span>
            <span className="text-base font-semibold">Pedido:</span> {orderId}
          </span>
          <div className="flex items-center justify-between w-full gap-2">
            <span>
              <span className="text-base font-semibold">
                Solicitud de devolución:{" "}
              </span>{" "}
              {totalRequestedQty}{" "}
              {totalRequestedQty > 1 ? "artículos" : "artículo"}
            </span>
            <span className="px-2 py-1 rounded border text-xs font-semibold">
              Aceptando: {totalAcceptedQty}
            </span>
          </div>
        </Card>
      )}

      <Card className="shadow-none">
        <h2 className="pt-4 px-4 text-base font-semibold">Productos:</h2>
        <CardContent className="p-0">
          <div className="p-4 space-y-2">
            {items.map((item) => {
              const requested = item.quantityReturnRequested;
              const availableInOrder = item.quantity - item.quantityReturned;

              const isRequestContext = totalRequestedQty > 0;

              if (isRequestContext && requested <= 0) return null;
              if (!isRequestContext && availableInOrder <= 0) return null;

              const maxLimit = isRequestContext ? requested : availableInOrder;
              const isSelected = (returnMap[item.id] || 0) > 0;

              return (
                <div
                  key={item.id}
                  className={`flex items-center gap-4 p-4 transition-colors border border-border ${
                    isSelected
                      ? " hover:bg-neutral-50 border-foreground"
                      : "hover:bg-neutral-50"
                  }`}
                >
                  <Checkbox
                    checked={isSelected}
                    onCheckedChange={(c) =>
                      handleToggleItem(item.id, maxLimit, c as boolean)
                    }
                  />

                  <div className="flex-1 text-sm">
                    <p className="font-medium text-base">{item.nameSnapshot}</p>
                    <p className="font-medium text-xs">
                      {item.sizeSnapshot} / {item.colorSnapshot}
                    </p>
                    <span className="font-medium text-xs">x{maxLimit}</span>
                    {requested > 0 && (
                      <p className="text-xs text-orange-600 font-medium">
                        Solicitado: {requested}
                      </p>
                    )}
                  </div>

                  <div className="flex items-center gap-3">
                    {isSelected ? (
                      <>
                        <span className="text-sm font-medium">Aceptar:</span>
                        <Input
                          type="number"
                          min={1}
                          max={maxLimit}
                          className="text-left bg-white"
                          value={returnMap[item.id] || ""}
                          onChange={(e) =>
                            handleQtyChange(item.id, e.target.value, maxLimit)
                          }
                        />
                      </>
                    ) : (
                      <span className="text-sm font-medium text-muted-foreground">
                        Pendiente: {maxLimit}
                      </span>
                    )}
                  </div>
                </div>
              );
            })}
          </div>
        </CardContent>
      </Card>

      {/* --- SECCIÓN DE RECHAZO PARCIAL (Solo si hay discrepancia) --- */}
      {isPartialRejection && totalAcceptedQty > 0 && (
        <div className="bg-orange-50 border border-orange-200 rounded-xs p-6 animate-in slide-in-from-bottom-2">
          <div className="flex items-center gap-2 mb-4 text-orange-800">
            <FaTriangleExclamation />
            <h3 className="font-semibold">Rechazo Parcial Detectado</h3>
          </div>
          <p className="text-sm text-orange-900 mb-4">
            El cliente solicitó devolver <strong>{totalRequestedQty}</strong>{" "}
            artículos, pero tú estás aceptando{" "}
            <strong>{totalAcceptedQty}</strong>, por favor indica el motivo por
            el cual rechazas el resto.
          </p>

          {/* TU DISEÑO DE SELECT + TEXTAREA */}
          <div className="space-y-3 bg-white p-4 rounded-xs border border-orange-100">
            <label className="text-sm font-medium">Motivo del rechazo</label>
            <Select value={rejectionReason} onValueChange={setRejectionReason}>
              <SelectTrigger className="w-full hover:cursor-pointer text-foreground font-medium">
                <SelectValue
                  placeholder="-- Selecciona motivo --"
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

            {rejectionReason === "Otro motivo" && (
              <textarea
                className="w-full border rounded-xs p-2 text-sm bg-background flex min-h-[100px] resize-none focus:outline-none focus:border-foreground"
                placeholder="Explica detalladamente por qué no aceptas estos artículos..."
                rows={3}
                value={customRejection}
                onChange={(e) => setCustomRejection(e.target.value)}
              />
            )}
          </div>
        </div>
      )}

      {/* FOOTER */}
      <div className="flex justify-end gap-4 border-t pt-6">
        <Button
          variant="outline"
          onClick={() => router.back()}
          disabled={loading}
        >
          Cancelar
        </Button>
        <Button
          onClick={handleSubmit}
          disabled={loading || totalAcceptedQty === 0}
          className="bg-blue-600 hover:bg-blue-700 w-48"
        >
          {loading ? "Procesando..." : "Confirmar Decisión"}
        </Button>
      </div>
    </div>
  );
}
