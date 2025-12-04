import "server-only";

import type { CartLineInput } from "./orders";

export const CART_COOKIE_NAME = "cart.v1";

type CartCookieV1 = {
  v: 1;
<<<<<<< HEAD
  items: {
    s: string;
    v: string;
    q: number;
  }[];
=======
  items: { s: string; q: number }[];
>>>>>>> b4c8f25 (feat(fase-6): pedidos con datos de envío en Prisma + vista demo de orders (#29))
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
<<<<<<< HEAD
        variantId: item.v,
        qty: item.q,
      }))
      .filter((line) => line.slug && line.variantId && line.qty > 0);
=======
        qty: item.q,
      }))
      .filter((line) => line.slug && line.qty > 0);
>>>>>>> b4c8f25 (feat(fase-6): pedidos con datos de envío en Prisma + vista demo de orders (#29))
  } catch {
    return [];
  }
}
