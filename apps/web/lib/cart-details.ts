export type CartItemDetails = {
  slug: string;
<<<<<<< HEAD
  variantId: string;
  name: string;
  variantName: string;
  priceMinor: number;
  imageUrl?: string;
  stock: number;
};

export type DetailsMap = Record<string, CartItemDetails>;
export const DETAILS_LS_KEY = "cart.details.v2";
export const DETAILS_EVENT_NAME = "cart-details-updated";

export function makeKey(slug: string, variantId: string) {
  return `${slug}:${variantId}`;
}
=======
  name: string;
  priceMinor: number;
  imageUrl?: string;
};

export type DetailsMap = Record<string, CartItemDetails>;
export const DETAILS_LS_KEY = "cart.details.v1";
>>>>>>> b4c8f25 (feat(fase-6): pedidos con datos de envío en Prisma + vista demo de orders (#29))

export function readDetailsMap(): DetailsMap {
  if (typeof window === "undefined") return {};
  try {
    const raw = window.localStorage.getItem(DETAILS_LS_KEY);
    if (!raw) return {};
    const arr = JSON.parse(raw) as CartItemDetails[];
    const map: DetailsMap = {};
<<<<<<< HEAD
    for (const d of arr) {
      if (d.slug && d.variantId) {
        map[makeKey(d.slug, d.variantId)] = d;
      }
    }
=======
    for (const d of arr) map[d.slug] = d;
>>>>>>> b4c8f25 (feat(fase-6): pedidos con datos de envío en Prisma + vista demo de orders (#29))
    return map;
  } catch {
    return {};
  }
}

export function writeDetailsMap(map: DetailsMap) {
  if (typeof window === "undefined") return;
  try {
    const arr = Object.values(map);
    window.localStorage.setItem(DETAILS_LS_KEY, JSON.stringify(arr));
<<<<<<< HEAD
    window.dispatchEvent(new Event(DETAILS_EVENT_NAME));
=======
>>>>>>> b4c8f25 (feat(fase-6): pedidos con datos de envío en Prisma + vista demo de orders (#29))
  } catch {}
}

export function upsertDetails(details: CartItemDetails) {
  const map = readDetailsMap();
<<<<<<< HEAD
  map[makeKey(details.slug, details.variantId)] = details;
=======
  map[details.slug] = details;
>>>>>>> b4c8f25 (feat(fase-6): pedidos con datos de envío en Prisma + vista demo de orders (#29))
  writeDetailsMap(map);
}

export function pruneDetails(keepSlugs: string[]) {
  const map = readDetailsMap();
  let changed = false;
  for (const slug in map) {
    if (!keepSlugs.includes(slug)) {
      delete map[slug];
      changed = true;
    }
  }
  if (changed) writeDetailsMap(map);
}
