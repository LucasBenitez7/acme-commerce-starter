export type CartItemMini = {
  slug: string;
<<<<<<< HEAD
  variantId: string;
=======
>>>>>>> b4c8f25 (feat(fase-6): pedidos con datos de envío en Prisma + vista demo de orders (#29))
  qty: number;
};

export type LastRemovedStackEntry = {
  slug: string;
<<<<<<< HEAD
  variantId: string;
=======
>>>>>>> b4c8f25 (feat(fase-6): pedidos con datos de envío en Prisma + vista demo de orders (#29))
  qty: number;
  removedAt: number;
  index: number;
};

export type CartState = {
  items: CartItemMini[];
  updatedAt: number | null;
  lastRemovedStack: LastRemovedStackEntry[];
};
