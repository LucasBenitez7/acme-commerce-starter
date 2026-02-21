import { getUserFavoriteIds } from "@/lib/favorites/queries";

import CartClientPage from "./CartClientPage";

import type { Metadata } from "next";

export const dynamic = "force-dynamic";

export const metadata: Metadata = {
  title: "Carrito",
  robots: { index: false, follow: false },
};

export default async function CartPage() {
  const favoriteIds = await getUserFavoriteIds();

  return (
    <>
      <CartClientPage favoriteIds={favoriteIds} />
    </>
  );
}
