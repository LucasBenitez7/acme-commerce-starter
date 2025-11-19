// apps/web/components/checkout/shipping/locations.ts

export type LocationBase = {
  id: string;
  name: string;
  addressLine1: string;
  addressLine2: string;
  distance: string;
  tag: string;
  schedule: string;
};

export const STORE_LOCATIONS: LocationBase[] = [
  {
    id: "marineda",
    name: "CC Marineda City",
    addressLine1: "Est. Baños de Arteixo, 43",
    addressLine2: "A Coruña 15008",
    distance: "1,6 km",
    tag: "Niños",
    schedule: "Horario habitual",
  },
  {
    id: "cuatro-caminos",
    name: "CC Cuatro Caminos",
    addressLine1: "Rda. de Outeiro, 24",
    addressLine2: "A Coruña 15004",
    distance: "2,1 km",
    tag: "Moda",
    schedule: "Horario habitual",
  },
  {
    id: "plaza-lugo",
    name: "Plaza de Lugo",
    addressLine1: "Plaza de Lugo, 1",
    addressLine2: "A Coruña 15004",
    distance: "2,8 km",
    tag: "Centro",
    schedule: "Horario habitual",
  },
];

export const PICKUP_LOCATIONS: LocationBase[] = [
  {
    id: "bar-rogelio",
    name: "Punto Bar",
    addressLine1: "Est. Baños de Arteixo, 43",
    addressLine2: "A Coruña 15008",
    distance: "1,6 km",
    tag: "Locker",
    schedule: "24h",
  },
  {
    id: "correos-express",
    name: "Punto Correos Express",
    addressLine1: "Rda. de Outeiro, 24",
    addressLine2: "A Coruña 15004",
    distance: "2,1 km",
    tag: "Oficina",
    schedule: "Horario comercial",
  },
  {
    id: "cp-locker",
    name: "Punto Cp Locker",
    addressLine1: "Plaza de Lugo, 1",
    addressLine2: "A Coruña 15004",
    distance: "2,8 km",
    tag: "Locker",
    schedule: "24h",
  },
];

export function findStoreLocation(id?: string | null) {
  if (!id) return undefined;
  return STORE_LOCATIONS.find((loc) => loc.id === id);
}

export function findPickupLocation(id?: string | null) {
  if (!id) return undefined;
  return PICKUP_LOCATIONS.find((loc) => loc.id === id);
}
