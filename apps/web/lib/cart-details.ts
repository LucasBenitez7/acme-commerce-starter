export type CartItemDetails = {
  slug: string;
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

export function readDetailsMap(): DetailsMap {
  if (typeof window === "undefined") return {};
  try {
    const raw = window.localStorage.getItem(DETAILS_LS_KEY);
    if (!raw) return {};
    const arr = JSON.parse(raw) as CartItemDetails[];
    const map: DetailsMap = {};
    for (const d of arr) {
      if (d.slug && d.variantId) {
        map[makeKey(d.slug, d.variantId)] = d;
      }
    }
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
    window.dispatchEvent(new Event(DETAILS_EVENT_NAME));
  } catch {}
}

export function upsertDetails(details: CartItemDetails) {
  const map = readDetailsMap();
  map[makeKey(details.slug, details.variantId)] = details;
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
