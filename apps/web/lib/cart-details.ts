export type CartItemDetails = {
  slug: string;
  name: string;
  priceMinor: number;
  imageUrl?: string;
};

export type DetailsMap = Record<string, CartItemDetails>;
export const DETAILS_LS_KEY = "cart.details.v1";

export function readDetailsMap(): DetailsMap {
  if (typeof window === "undefined") return {};
  try {
    const raw = window.localStorage.getItem(DETAILS_LS_KEY);
    if (!raw) return {};
    const arr = JSON.parse(raw) as CartItemDetails[];
    const map: DetailsMap = {};
    for (const d of arr) map[d.slug] = d;
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
  } catch {}
}

export function upsertDetails(details: CartItemDetails) {
  const map = readDetailsMap();
  map[details.slug] = details;
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
