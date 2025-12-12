import "@/app/globals.css";
import { cookies } from "next/headers";

import { Header, Footer } from "@/components/layout";
import { Container } from "@/components/ui";

import { getHeaderCategories } from "@/lib/server/categories";

import Providers from "@/app/providers";
import { CART_COOKIE_NAME, decodeCookie } from "@/store/cart.persist";
import { type CartState } from "@/store/cart.types";

import type { RootState } from "@/store";
import type { ReactNode } from "react";

export const metadata = {
  title: "algo",
};

export default async function SiteLayout({
  children,
}: {
  children: ReactNode;
}) {
  const c = await cookies();
  const raw = c.get(CART_COOKIE_NAME)?.value;
  const items = decodeCookie(raw);

  const preloadedState: Partial<RootState> = {
    cart: {
      items,
      updatedAt: Date.now(),
      lastRemovedStack: [],
    } satisfies CartState,
  };

  const categories = await getHeaderCategories();

  return (
    <Providers preloadedState={preloadedState}>
      <div className="flex min-h-dvh flex-col bg-neutral-100">
        <Header categories={categories} />
        <div className="flex-1">
          <Container className="bg-neutral-100">
            <main>{children}</main>
          </Container>
        </div>
        <Footer />
      </div>
    </Providers>
  );
}
