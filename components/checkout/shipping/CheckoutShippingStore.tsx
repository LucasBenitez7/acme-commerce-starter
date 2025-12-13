"use client";

import { useFormContext } from "react-hook-form";

import { STORE_LOCATIONS } from "@/components/checkout/shared/locations";
import { Input, Label, Button } from "@/components/ui";

import type { CheckoutFormValues } from "@/lib/validation/checkout";

export function CheckoutShippingStore() {
  const {
    register,
    watch,
    setValue,
    formState: { errors },
  } = useFormContext<CheckoutFormValues>();

  const storeLocationId = watch("storeLocationId");
  const storeSearch = watch("storeSearch") || "";

  const selectedStore = STORE_LOCATIONS.find((s) => s.id === storeLocationId);

  const filteredStores = STORE_LOCATIONS.filter((s) =>
    s.name.toLowerCase().includes(storeSearch.toLowerCase()),
  );

  // Handlers para actualizar el formulario
  const handleSelect = (id: string) => {
    setValue("storeLocationId", id, {
      shouldValidate: true,
      shouldDirty: true,
    });
  };

  const handleClear = () => {
    setValue("storeLocationId", "", { shouldValidate: true });
  };

  return (
    <div className="space-y-4 pt-2 animate-in fade-in slide-in-from-top-2">
      {/* CASO 1: NO HAY TIENDA SELECCIONADA (MOSTRAR BUSCADOR Y LISTA) */}
      {!selectedStore && (
        <div className="space-y-4 rounded-lg border bg-card p-4">
          <div className="space-y-2">
            <Label htmlFor="storeSearch">
              Busca una tienda para recoger tu pedido
            </Label>
            <Input
              id="storeSearch"
              placeholder="Ej. Centro..."
              {...register("storeSearch")}
            />
            {/* Mensaje de ayuda si no hay resultados */}
            {storeSearch && filteredStores.length === 0 && (
              <p className="text-xs text-muted-foreground">
                No encontramos tiendas con ese nombre.
              </p>
            )}
          </div>

          <div className="space-y-2">
            <p className="text-xs text-muted-foreground font-medium">
              Tiendas disponibles:
            </p>
            <div className="grid gap-2 max-h-[300px] overflow-y-auto">
              {filteredStores.map((store) => (
                <button
                  key={store.id}
                  type="button"
                  onClick={() => handleSelect(store.id)}
                  className="group flex flex-col items-start gap-1 rounded-md border p-3 text-left hover:bg-muted/50 hover:border-primary transition-all"
                >
                  <div className="flex w-full justify-between items-center">
                    <span className="font-semibold text-sm group-hover:text-primary">
                      {store.name}
                    </span>
                    <span className="text-[10px] bg-secondary px-1.5 py-0.5 rounded text-secondary-foreground">
                      {store.distance}
                    </span>
                  </div>
                  <span className="text-xs text-muted-foreground">
                    {store.addressLine1}, {store.addressLine2}
                  </span>
                  <div className="flex gap-2 mt-1">
                    <span className="text-[10px] border px-1 rounded text-muted-foreground">
                      {store.tag}
                    </span>
                    <span className="text-[10px] border px-1 rounded text-muted-foreground">
                      {store.schedule}
                    </span>
                  </div>
                </button>
              ))}
            </div>
          </div>
          {/* Error oculto (se muestra si intentas continuar sin seleccionar) */}
          {errors.storeLocationId && (
            <p className="text-sm text-destructive font-medium bg-destructive/10 p-2 rounded">
              {errors.storeLocationId.message}
            </p>
          )}
        </div>
      )}

      {/* CASO 2: TIENDA YA SELECCIONADA (MOSTRAR RESUMEN) */}
      {selectedStore && (
        <div className="space-y-2">
          <div className="flex items-center justify-between">
            <p className="text-base font-medium text-foreground">
              Tienda seleccionada
            </p>
            <Button
              variant="link"
              size="sm"
              onClick={handleClear}
              className="h-auto p-0 text-primary"
            >
              Cambiar tienda
            </Button>
          </div>

          <div className="rounded-md border bg-primary/5 border-primary/20 p-4 space-y-1 text-sm relative">
            {/* Badge de check */}
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

            <p className="font-bold text-base">{selectedStore.name}</p>
            <p className="text-muted-foreground">
              {selectedStore.addressLine1}
            </p>
            <p className="text-muted-foreground">
              {selectedStore.addressLine2}
            </p>

            <div className="flex flex-wrap items-center gap-2 mt-2 pt-2 border-t border-primary/10">
              <span className="text-xs bg-background border px-2 py-1 rounded shadow-sm">
                {selectedStore.schedule}
              </span>
              <span className="text-xs text-muted-foreground">
                {selectedStore.distance} de ti
              </span>
            </div>
          </div>

          {/* Input oculto real para que React Hook Form lo registre */}
          <input type="hidden" {...register("storeLocationId")} />
        </div>
      )}
    </div>
  );
}
