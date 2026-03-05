import "@/app/globals.css";

import { Header, Footer } from "@/components/layout";

import { getHeaderCategories } from "@/lib/categories/queries";
import { getMaxDiscountPercentage } from "@/lib/products/queries";

import Providers from "@/app/providers";

import type { ReactNode } from "react";

export default async function SiteLayout({
  children,
}: {
  children: ReactNode;
}) {
  const [categories, maxDiscount] = await Promise.all([
    getHeaderCategories(),
    getMaxDiscountPercentage(),
  ]);

  return (
    <Providers>
      <div
        className="flex min-h-dvh flex-col bg-background text-foreground font-sans overflow-x-clip"
        style={{
          maxWidth:
            "var(--content-max-w, calc(100vw - (var(--header-pr, 16px) - 16px)))",
        }}
      >
        <Header categories={categories} maxDiscount={maxDiscount} />

        <div className="flex-1 flex flex-col">{children}</div>

        <Footer />
      </div>
    </Providers>
  );
}
