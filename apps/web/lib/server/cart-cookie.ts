import "server-only";

import type { CartLineInput } from "./orders";

export const CART_COOKIE_NAME = "cart.v1";

type CartCookieV1 = {
  v: 1;
  items: {
    s: string;
    v: string;
    q: number;
  }[];
};

export function parseCartCookie(raw: string | undefined): CartLineInput[] {
  if (!raw) return [];

  try {
    const data = JSON.parse(raw) as CartCookieV1;

    if (data?.v !== 1 || !Array.isArray(data.items)) {
      return [];
    }

    return data.items
      .map((item) => ({
        slug: item.s,
        variantId: item.v,
        qty: item.q,
      }))
      .filter((line) => line.slug && line.variantId && line.qty > 0);
  } catch {
    return [];
  }
}
