"use client";

import { useFormContext } from "react-hook-form";

import { PICKUP_LOCATIONS } from "@/components/checkout/shared/locations";
import { Input, Label, Button } from "@/components/ui";

import type { CheckoutFormValues } from "@/lib/validation/checkout";

export function CheckoutShippingPickup() {
  const {
    register,
    watch,
    setValue,
    formState: { errors },
  } = useFormContext<CheckoutFormValues>();

  const pickupLocationId = watch("pickupLocationId");
  const pickupSearch = watch("pickupSearch") || "";

  const selectedPickupLocation = PICKUP_LOCATIONS.find(
    (location) => location.id === pickupLocationId,
  );

  // Filtrado básico
  const filteredLocations = PICKUP_LOCATIONS.filter((loc) =>
    loc.name.toLowerCase().includes(pickupSearch.toLowerCase()),
  );

  const handleSelect = (id: string) => {
    setValue("pickupLocationId", id, {
      shouldValidate: true,
      shouldDirty: true,
    });
  };

  const handleClear = () => {
    setValue("pickupLocationId", "", { shouldValidate: true });
  };

  return (
    <div className="space-y-4 pt-2 animate-in fade-in slide-in-from-top-2">
      {!selectedPickupLocation && (
        <div className="space-y-4 rounded-lg border bg-card p-4">
          <div className="space-y-2">
            <Label htmlFor="pickupSearch">Busca un punto de recogida</Label>
            <Input
              id="pickupSearch"
              placeholder="Ej. Calle Real..."
              {...register("pickupSearch")}
            />
          </div>

          {/* Mostrar resultados solo si hay algo escrito o lista completa si prefieres */}
          <div className="space-y-2">
            <p className="text-xs text-muted-foreground font-medium">
              Puntos cercanos:
            </p>
            <div className="grid gap-2 max-h-[300px] overflow-y-auto">
              {filteredLocations.map((loc) => (
                <button
                  key={loc.id}
                  type="button"
                  onClick={() => handleSelect(loc.id)}
                  className="group flex flex-col items-start gap-1 rounded-md border p-3 text-left hover:bg-muted/50 hover:border-primary transition-colors"
                >
                  <div className="flex w-full justify-between">
                    <span className="font-semibold text-sm group-hover:text-primary">
                      {loc.name}
                    </span>
                    <span className="text-[10px] bg-muted px-1.5 py-0.5 rounded">
                      {loc.distance}
                    </span>
                  </div>
                  <span className="text-xs text-muted-foreground">
                    {loc.addressLine1}
                  </span>
                  <span className="text-[10px] text-muted-foreground/80 mt-1 block">
                    Horario: {loc.schedule}
                  </span>
                </button>
              ))}
              {filteredLocations.length === 0 && pickupSearch !== "" && (
                <p className="text-sm text-muted-foreground p-2">
                  No encontramos puntos en esa zona.
                </p>
              )}
            </div>
          </div>

          {errors.pickupLocationId && (
            <p className="text-sm text-destructive font-medium bg-destructive/10 p-2 rounded">
              ⚠️ {errors.pickupLocationId.message}
            </p>
          )}
        </div>
      )}

      {selectedPickupLocation && (
        <div className="space-y-2">
          <div className="flex items-center justify-between">
            <p className="text-base font-medium text-foreground">
              Punto seleccionado
            </p>
            <Button
              variant="link"
              size="sm"
              onClick={handleClear}
              className="h-auto p-0"
            >
              Cambiar punto
            </Button>
          </div>

          <div className="rounded-md border bg-primary/5 border-primary/20 p-4 space-y-1 text-sm relative">
            <div className="absolute top-3 right-3 text-primary">
              <svg
                xmlns="http://www.w3.org/2000/svg"
                width="20"
                height="20"
                viewBox="0 0 24 24"
                fill="none"
                stroke="currentColor"
                strokeWidth="2"
                strokeLinecap="round"
                strokeLinejoin="round"
              >
                <polyline points="20 6 9 17 4 12" />
              </svg>
            </div>
            <p className="font-bold text-base">{selectedPickupLocation.name}</p>
            <p className="text-muted-foreground">
              {selectedPickupLocation.addressLine1}
            </p>
            <p className="text-muted-foreground">
              {selectedPickupLocation.addressLine2}
            </p>

            <div className="flex gap-2 mt-2 pt-2 border-t border-primary/10 text-xs text-muted-foreground">
              <span>{selectedPickupLocation.schedule}</span>
            </div>
          </div>

          <input type="hidden" {...register("pickupLocationId")} />
        </div>
      )}
    </div>
  );
}
