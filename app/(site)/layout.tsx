import "@/app/globals.css";

import { Header, Footer } from "@/components/layout";

import { getHeaderCategories } from "@/lib/categories/queries";
import { getMaxDiscountPercentage } from "@/lib/products/queries";

import Providers from "@/app/providers";

import type { ReactNode } from "react";

export const metadata = {
  title: "LSB Shop",
  description: "Tu tienda de confianza",
};

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
      <div className="flex min-h-dvh flex-col bg-neutral-50 text-neutral-900 font-sans">
        <Header categories={categories} maxDiscount={maxDiscount} />

        <div className="flex-1 flex flex-col">{children}</div>

        <Footer />
      </div>
    </Providers>
  );
}
