import { PICKUP_LOCATIONS } from "@/components/checkout/shared/locations";
import { CheckoutContactFields } from "@/components/checkout/shipping/CheckoutContactFields";
import { Input, Label } from "@/components/ui";

import type {
  CheckoutClientErrors,
  CheckoutFormState,
} from "@/hooks/use-checkout-form";

type CheckoutShippingPickupProps = {
  form: CheckoutFormState;
  errors: CheckoutClientErrors;
  onChange: <K extends keyof CheckoutFormState>(
    key: K,
    value: CheckoutFormState[K],
  ) => void;
};

export function CheckoutShippingPickup({
  form,
  errors,
  onChange,
}: CheckoutShippingPickupProps) {
  const { pickupLocationId, pickupSearch } = form;
  const { pickupSearch: pickupSearchError } = errors;

  const hasSearch = pickupSearch.trim().length > 0;
  const hasSelectedLocation = Boolean(pickupLocationId);

  const selectedPickupLocation = PICKUP_LOCATIONS.find(
    (location) => location.id === pickupLocationId,
  );

  return (
    <div className="space-y-3 pt-2">
      {/* MODO SELECCIÓN: aún no hay punto elegido */}
      {!hasSelectedLocation && (
        <>
          <div className="space-y-2">
            <Label htmlFor="pickupSearch">Busca un punto de recogida</Label>
            <Input
              id="pickupSearch"
              name="pickupSearch"
              value={pickupSearch}
              onChange={(e) => onChange("pickupSearch", e.target.value)}
              placeholder="Ej. 15008 o A Coruña centro"
              aria-invalid={pickupSearchError || undefined}
              aria-describedby={
                pickupSearchError ? "pickupSearch-error" : undefined
              }
            />
            {pickupSearchError && (
              <p id="pickupSearch-error" className="text-xs text-destructive">
                Introduce un código postal válido o zona para buscar puntos de
                recogida
              </p>
            )}
          </div>

          {hasSearch && (
            <div className="space-y-3">
              {PICKUP_LOCATIONS.map((location) => {
                const isSelected = pickupLocationId === location.id;

                return (
                  <label
                    key={location.id}
<<<<<<< HEAD
                    className={`flex w-full cursor-pointer flex-col rounded-xs space-y-1 border p-3 text-left text-xs sm:text-sm transition-colors ${
=======
                    className={`flex w-full cursor-pointer flex-col rounded-lb border p-3 text-left text-xs sm:text-sm transition-colors ${
>>>>>>> b4c8f25 (feat(fase-6): pedidos con datos de envío en Prisma + vista demo de orders (#29))
                      isSelected
                        ? "border-primary bg-primary/5"
                        : "border-border hover:border-primary/60 hover:bg-neutral-50"
                    }`}
                  >
                    <input
                      type="radio"
                      name="pickupLocationId"
                      value={location.id}
                      checked={isSelected}
                      onChange={() => onChange("pickupLocationId", location.id)}
                      className="sr-only"
                    />
                    <p className="text-sm font-semibold">{location.name}</p>
                    <p className="text-xs text-muted-foreground">
                      {location.addressLine1}
                    </p>
                    <p className="text-xs text-muted-foreground">
                      {location.addressLine2}
                    </p>

<<<<<<< HEAD
                    <div className="flex flex-wrap items-center gap-2 text-[0.7rem] text-muted-foreground">
                      <span>{location.tag}</span>
                      <span>{location.distance}</span>
=======
                    <div className="mt-2 flex flex-wrap items-center gap-2 text-[0.7rem] text-muted-foreground">
                      <span>{location.tag}</span>
                      <span>·</span>
                      <span>{location.distance}</span>
                      <span>·</span>
>>>>>>> b4c8f25 (feat(fase-6): pedidos con datos de envío en Prisma + vista demo de orders (#29))
                      <span>{location.schedule}</span>
                    </div>
                  </label>
                );
              })}
            </div>
          )}
        </>
      )}

      {/* MODO YA SELECCIONADO */}
      {hasSelectedLocation && selectedPickupLocation && (
        <div>
          <div className="flex items-center justify-between pb-1">
            <div>
              <p className="text-base font-medium text-foreground">
                Punto de recogida seleccionado
              </p>
            </div>

            <button
              type="button"
              className="text-sm mr-1 font-medium fx-underline-anim"
              onClick={() => onChange("pickupLocationId", "")}
            >
              Editar
            </button>
          </div>

<<<<<<< HEAD
          <div className="rounded-xs border p-3 space-y-1 text-xs sm:text-sm">
=======
          <div className="rounded-lb border p-3 text-xs sm:text-sm">
>>>>>>> b4c8f25 (feat(fase-6): pedidos con datos de envío en Prisma + vista demo de orders (#29))
            <p className="text-sm font-semibold">
              {selectedPickupLocation.name}
            </p>
            <p className="text-xs text-muted-foreground">
              {selectedPickupLocation.addressLine1}
            </p>
            <p className="text-xs text-muted-foreground">
              {selectedPickupLocation.addressLine2}
            </p>

<<<<<<< HEAD
            <div className="flex flex-wrap items-center gap-2 text-[0.7rem] text-muted-foreground">
              <span>{selectedPickupLocation.tag}</span>
              <span>{selectedPickupLocation.distance}</span>
=======
            <div className="mt-2 flex flex-wrap items-center gap-2 text-[0.7rem] text-muted-foreground">
              <span>{selectedPickupLocation.tag}</span>
              <span>·</span>
              <span>{selectedPickupLocation.distance}</span>
              <span>·</span>
>>>>>>> b4c8f25 (feat(fase-6): pedidos con datos de envío en Prisma + vista demo de orders (#29))
              <span>{selectedPickupLocation.schedule}</span>
            </div>
          </div>

<<<<<<< HEAD
          <div className="space-y-1 pt-6">
=======
          <div className="space-y-2 pt-6">
>>>>>>> b4c8f25 (feat(fase-6): pedidos con datos de envío en Prisma + vista demo de orders (#29))
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
