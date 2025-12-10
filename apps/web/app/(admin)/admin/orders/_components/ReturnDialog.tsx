"use client";

import { useState, useEffect } from "react";
import { FaRotateLeft } from "react-icons/fa6";
import { toast } from "sonner";

import { Button, Checkbox, Input } from "@/components/ui";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog";

import { processPartialReturnAction } from "../actions";

type OrderItem = {
  id: string;
  nameSnapshot: string;
  sizeSnapshot: string | null;
  colorSnapshot: string | null;
  quantity: number;
  quantityReturned: number;
  quantityReturnRequested: number;
};

export function ReturnDialog({
  orderId,
  items,
}: {
  orderId: string;
  items: OrderItem[];
}) {
  const [open, setOpen] = useState(false);
  const [loading, setLoading] = useState(false);
  const [returnMap, setReturnMap] = useState<Record<string, number>>({});

  useEffect(() => {
    if (open) {
      const initialMap: Record<string, number> = {};
      items.forEach((item) => {
        if (item.quantityReturnRequested > 0) {
          // Por defecto seleccionamos todo lo que el usuario pidió
          initialMap[item.id] = item.quantityReturnRequested;
        }
      });
      setReturnMap(initialMap);
    }
  }, [open, items]);

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
    setLoading(true);
    const payload = Object.entries(returnMap)
      .filter(([_, qty]) => qty > 0)
      .map(([itemId, qty]) => ({ itemId, qtyToReturn: qty }));

    if (payload.length === 0) {
      setLoading(false);
      toast.error("No hay nada seleccionado para devolver");
      return;
    }

    const res = await processPartialReturnAction(orderId, payload);

    if (res.error) {
      toast.error(res.error);
    } else {
      toast.success("Devolución aceptada y stock restaurado");
      setOpen(false);
      setReturnMap({});
    }
    setLoading(false);
  };

  // Calculamos si queda algo por devolver en toda la orden
  const hasRequests = items.some((i) => i.quantityReturnRequested > 0);

  if (!hasRequests) return null;

  return (
    <Dialog open={open} onOpenChange={setOpen}>
      <DialogTrigger asChild>
        <Button variant="outline" size="sm">
          <FaRotateLeft className="mr-2 h-3 w-3" />
          Gestionar Devolución
        </Button>
      </DialogTrigger>
      <DialogContent className="max-w-lg">
        <DialogHeader>
          <DialogTitle>Aceptar Devolución</DialogTitle>
        </DialogHeader>

        <div className="space-y-4 py-4">
          <p className="text-sm text-muted-foreground">
            Confirma los artículos que aceptas devolver
          </p>
          <div className="space-y-2 max-h-[60vh] overflow-y-auto pr-2">
            {items.map((item) => {
              const requested = item.quantityReturnRequested;
              if (requested <= 0) return null;

              const isSelected = (returnMap[item.id] || 0) > 0;

              return (
                <div
                  key={item.id}
                  className={`flex items-center gap-3 border p-3 rounded-xs transition-colors ${isSelected ? "border-blue-500 bg-blue-50/50" : "border-neutral-200"}`}
                >
                  {/* Checkbox de Selección */}
                  <Checkbox
                    checked={isSelected}
                    onCheckedChange={(c) =>
                      handleToggleItem(item.id, requested, c as boolean)
                    }
                  />

                  <div className="flex-1 text-sm">
                    <p className="font-medium">{item.nameSnapshot}</p>
                    <p className="text-muted-foreground text-xs">
                      {item.sizeSnapshot} / {item.colorSnapshot}
                    </p>
                    <p className="text-xs text-orange-600 font-semibold mt-1">
                      El cliente quiere devolver: {requested}
                    </p>
                  </div>

                  {/* Input de cantidad (Solo visible si seleccionado) */}
                  <div className="flex items-center gap-2">
                    {isSelected ? (
                      <>
                        <span className="text-xs text-muted-foreground">
                          Aceptar:
                        </span>
                        <Input
                          type="number"
                          min={1}
                          max={requested} // MAXIMO LO SOLICITADO
                          className="w-16 h-8 text-right bg-white"
                          value={returnMap[item.id] || ""}
                          onChange={(e) =>
                            handleQtyChange(item.id, e.target.value, requested)
                          }
                        />
                        <span className="text-xs text-muted-foreground">
                          / {requested}
                        </span>
                      </>
                    ) : (
                      <span className="text-xs text-muted-foreground">
                        Solicitado: {requested}
                      </span>
                    )}
                  </div>
                </div>
              );
            })}
          </div>
          <Button
            onClick={handleSubmit}
            disabled={loading}
            className="w-full bg-red-600 hover:bg-red-700 text-white"
          >
            {loading ? "Procesando..." : "Confirmar Devolución de Stock"}
          </Button>
          1
        </div>
      </DialogContent>
    </Dialog>
  );
}
