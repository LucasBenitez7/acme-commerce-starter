"use client";

import { useState } from "react";
import { FaRotateLeft } from "react-icons/fa6";
import { toast } from "sonner";

import { Button, Input } from "@/components/ui";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog";

import { processPartialReturnAction } from "@/app/(admin)/admin/orders/actions";

type OrderItem = {
  id: string;
  nameSnapshot: string;
  sizeSnapshot: string | null;
  colorSnapshot: string | null;
  quantity: number;
  quantityReturned: number;
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

  // Estado local para guardar cuánto devolvemos de cada item
  // Mapa: { itemId: cantidad_a_devolver }
  const [returnMap, setReturnMap] = useState<Record<string, number>>({});

  const handleQtyChange = (itemId: string, val: string, max: number) => {
    const num = parseInt(val) || 0;
    if (num < 0) return;
    if (num > max) return; // No dejar poner más de lo disponible

    setReturnMap((prev) => ({ ...prev, [itemId]: num }));
  };

  const handleSubmit = async () => {
    setLoading(true);

    // Convertimos el mapa a array para la server action
    const payload = Object.entries(returnMap)
      .filter(([_, qty]) => qty > 0)
      .map(([itemId, qty]) => ({ itemId, qtyToReturn: qty }));

    if (payload.length === 0) {
      setLoading(false);
      toast.error("Selecciona al menos un artículo para devolver");
      return;
    }

    const res = await processPartialReturnAction(orderId, payload);

    if (res.error) {
      toast.error(res.error);
    } else {
      toast.success("Devolución procesada y stock restaurado");
      setOpen(false);
      setReturnMap({});
    }
    setLoading(false);
  };

  // Calculamos si queda algo por devolver en toda la orden
  const canReturnSomething = items.some(
    (i) => i.quantity - i.quantityReturned > 0,
  );

  if (!canReturnSomething) return null; // Si todo está devuelto, ocultamos botón

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
          <DialogTitle>Procesar Devolución Parcial</DialogTitle>
        </DialogHeader>

        <div className="space-y-4 py-4">
          <p className="text-sm text-muted-foreground">
            Selecciona la cantidad de artículos que el cliente ha devuelto. El
            stock se sumará automáticamente al inventario.
          </p>

          <div className="space-y-3">
            {items.map((item) => {
              const availableToReturn = item.quantity - item.quantityReturned;
              if (availableToReturn <= 0) return null;

              return (
                <div
                  key={item.id}
                  className="flex items-center justify-between border p-3 rounded-md"
                >
                  <div className="text-sm">
                    <p className="font-medium">{item.nameSnapshot}</p>
                    <p className="text-muted-foreground text-xs">
                      {item.sizeSnapshot} / {item.colorSnapshot}
                    </p>
                    <p className="text-xs mt-1 text-blue-600">
                      Comprados: {item.quantity} | Devueltos:{" "}
                      {item.quantityReturned}
                    </p>
                  </div>
                  <div className="flex items-center gap-2">
                    <span className="text-xs text-muted-foreground">
                      Devolver:
                    </span>
                    <Input
                      type="number"
                      min={0}
                      max={availableToReturn}
                      className="w-20 h-8 text-right"
                      value={returnMap[item.id] || ""}
                      placeholder="0"
                      onChange={(e) =>
                        handleQtyChange(
                          item.id,
                          e.target.value,
                          availableToReturn,
                        )
                      }
                    />
                    <span className="text-xs text-muted-foreground w-12">
                      / {availableToReturn}
                    </span>
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
        </div>
      </DialogContent>
    </Dialog>
  );
}
