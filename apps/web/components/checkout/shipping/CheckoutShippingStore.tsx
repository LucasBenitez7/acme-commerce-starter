import { STORE_LOCATIONS } from "@/components/checkout/shared/locations";
import { CheckoutContactFields } from "@/components/checkout/shipping/CheckoutContactFields";
import { Input, Label } from "@/components/ui";

import type {
  CheckoutClientErrors,
  CheckoutFormState,
} from "@/hooks/use-checkout-form";

type CheckoutShippingStoreProps = {
  form: CheckoutFormState;
  errors: CheckoutClientErrors;
  onChange: <K extends keyof CheckoutFormState>(
    key: K,
    value: CheckoutFormState[K],
  ) => void;
};

export function CheckoutShippingStore({
  form,
  errors,
  onChange,
}: CheckoutShippingStoreProps) {
  const { storeLocationId, storeSearch } = form;
  const { storeLocation: storeLocationError } = errors;

  const hasSearch = storeSearch.trim().length > 0;
  const hasSelectedLocation = Boolean(storeLocationId);

  const selectedStore = STORE_LOCATIONS.find((s) => s.id === storeLocationId);

  return (
    <div className="space-y-3 pt-2">
      {/* MODO SELECCIÓN: todavía no hay tienda elegida */}
      {!hasSelectedLocation && (
        <>
          <div className="space-y-2">
            <Label htmlFor="storeSearch">
              Busca una tienda para recoger tu pedido
            </Label>
            <Input
              id="storeSearch"
              name="storeSearch"
              value={storeSearch}
              onChange={(e) => onChange("storeSearch", e.target.value)}
              placeholder="Ej. 15008 o A Coruña centro"
              aria-invalid={storeLocationError || undefined}
              aria-describedby={
                storeLocationError ? "storeSearch-error" : undefined
              }
            />
            {storeLocationError && (
              <p id="storeSearch-error" className="text-xs text-destructive">
                Introduce un código postal válido o zona para buscar tiendas
              </p>
            )}
          </div>

          {hasSearch && (
            <div className="space-y-3">
              {STORE_LOCATIONS.map((store) => {
                const isSelected = storeLocationId === store.id;

                return (
                  <label
                    key={store.id}
                    className={`flex w-full cursor-pointer flex-col rounded-lb border p-3 text-left text-xs sm:text-sm transition-colors ${
                      isSelected
                        ? "border-primary bg-primary/5"
                        : "border-border hover:border-primary/60 hover:bg-neutral-50"
                    }`}
                  >
                    <input
                      type="radio"
                      name="storeLocationId"
                      value={store.id}
                      checked={isSelected}
                      onChange={() => onChange("storeLocationId", store.id)}
                      className="sr-only"
                    />
                    <p className="text-sm font-semibold">{store.name}</p>
                    <p className="text-xs text-muted-foreground">
                      {store.addressLine1}
                    </p>
                    <p className="text-xs text-muted-foreground">
                      {store.addressLine2}
                    </p>

                    <div className="mt-2 flex flex-wrap items-center gap-2 text-[0.7rem] text-muted-foreground">
                      <span>{store.tag}</span>
                      <span>·</span>
                      <span>{store.distance}</span>
                      <span>·</span>
                      <span>{store.schedule}</span>
                    </div>
                  </label>
                );
              })}
            </div>
          )}
        </>
      )}

      {/* MODO YA SELECCIONADO: ocultar búsqueda, mostrar solo tienda elegida + contacto */}
      {hasSelectedLocation && selectedStore && (
        <div>
          <div className="flex items-center justify-between pb-1">
            <p className="text-base font-medium text-foreground">
              Tienda seleccionada
            </p>

            <button
              type="button"
              className="text-sm mr-1 font-medium fx-underline-anim"
              onClick={() => onChange("storeLocationId", "")}
            >
              Editar
            </button>
          </div>

          <div className="rounded-lb space-y-1 border p-3 text-xs sm:text-sm">
            <p className="text-sm font-semibold">{selectedStore.name}</p>
            <p className="text-xs text-muted-foreground">
              {selectedStore.addressLine1}
            </p>
            <p className="text-xs text-muted-foreground">
              {selectedStore.addressLine2}
            </p>

            <div className="flex flex-wrap items-center gap-2 text-[0.7rem] text-muted-foreground">
              <span>{selectedStore.tag}</span>
              <span>·</span>
              <span>{selectedStore.distance}</span>
              <span>·</span>
              <span>{selectedStore.schedule}</span>
            </div>
          </div>

          <div className="space-y-1 pt-6">
            <p className="text-base font-medium text-foreground">
              Datos de contacto
            </p>
            <CheckoutContactFields
              form={form}
              errors={errors}
              onChange={onChange}
            />
          </div>
        </div>
      )}
    </div>
  );
}
