import "@/app/globals.css";

import { Header, Footer } from "@/components/layout";

import { getHeaderCategories } from "@/lib/categories/queries";

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
  const categories = await getHeaderCategories();

  return (
    <Providers>
      <div className="flex min-h-dvh flex-col bg-neutral-50 text-neutral-900 font-sans">
        <Header categories={categories} />

        <div className="flex-1 flex flex-col">{children}</div>

        <Footer />
      </div>
    </Providers>
  );
}
