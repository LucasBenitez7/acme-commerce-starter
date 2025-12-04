import type { CartItemMini } from "./cart.types";

export const CART_COOKIE_NAME = "cart.v1";
export const CART_LS_KEY = "cart.v1";
export const CART_COOKIE_MAX_AGE = 60 * 60 * 24 * 30; // 30 días

export function encodeCookie(items: CartItemMini[]): string {
  const payload = {
    v: 1 as const,
<<<<<<< HEAD
    items: items.map((i) => ({
      s: i.slug,
      v: i.variantId,
      q: i.qty,
    })),
=======
    items: items.map((i) => ({ s: i.slug, q: i.qty })),
>>>>>>> b4c8f25 (feat(fase-6): pedidos con datos de envío en Prisma + vista demo de orders (#29))
  };
  return JSON.stringify(payload);
}

export function decodeCookie(raw: string | undefined | null): CartItemMini[] {
  if (!raw) return [];
  try {
    const parsed = JSON.parse(raw);
    if (parsed && parsed.v === 1 && Array.isArray(parsed.items)) {
      return parsed.items
<<<<<<< HEAD
        .map((x: any) => ({
          slug: String(x.s),
          variantId: String(x.v || ""),
          qty: Number(x.q),
        }))
        .filter(
          (i: CartItemMini) =>
            i.slug && i.variantId && Number.isFinite(i.qty) && i.qty > 0,
=======
        .map((x: any) => ({ slug: String(x.s), qty: Number(x.q) }))
        .filter(
          (i: CartItemMini) => i.slug && Number.isFinite(i.qty) && i.qty > 0,
>>>>>>> b4c8f25 (feat(fase-6): pedidos con datos de envío en Prisma + vista demo de orders (#29))
        );
    }
  } catch {}
  return [];
}

export function readFromLocalStorage(): CartItemMini[] {
  if (typeof window === "undefined") return [];
  try {
    const raw = window.localStorage.getItem(CART_LS_KEY);
    return decodeCookie(raw);
  } catch {
    return [];
  }
}

export function writeEverywhere(items: CartItemMini[]) {
  const encoded = encodeURIComponent(encodeCookie(items));

  if (typeof document !== "undefined") {
    const siteUrl = process.env.NEXT_PUBLIC_SITE_URL || "";
    const isProd = process.env.NODE_ENV === "production";
    const isHttps =
      (typeof window !== "undefined" &&
        window.location.protocol === "https:") ||
      siteUrl.startsWith("https");

    const secure = isProd && isHttps ? "; Secure" : "";
    document.cookie =
      `${CART_COOKIE_NAME}=${encoded}; ` +
      `Max-Age=${CART_COOKIE_MAX_AGE}; Path=/; SameSite=Lax${secure}`;
  }

  if (typeof window !== "undefined") {
    try {
      window.localStorage.setItem(CART_LS_KEY, encodeCookie(items));
    } catch {}
  }
}
