import { getUserFavoriteIds } from "@/lib/favorites/queries";

import CartClientPage from "./CartClientPage";

export const dynamic = "force-dynamic";

export default async function CartPage() {
  const favoriteIds = await getUserFavoriteIds();

  return (
    <>
      <CartClientPage favoriteIds={favoriteIds} />
    </>
  );
}
