import FeaturedGrid from "@/components/home/FeaturedGrid";
import HeroSection from "@/components/home/HeroSection";
import InterestSection from "@/components/home/InterestSection";
import SaleBanner from "@/components/home/SaleBanner";

import { prisma } from "@/lib/db";
import { getMaxDiscountPercentage } from "@/lib/products/queries";
import { getStoreConfig } from "@/lib/settings/service";

import type { Metadata } from "next";

export const dynamic = "force-dynamic";

export const metadata: Metadata = {
  title: "Inicio",
  description:
    "Bienvenido a LSB Shop — moda moderna con estilo propio. Descubre novedades, rebajas y las mejores prendas seleccionadas para ti.",
  alternates: { canonical: "/" },
  openGraph: {
    url: "/",
    title: "LSB Shop — Moda moderna con estilo propio",
    description:
      "Ropa de calidad, novedades constantes y los mejores precios. Envío rápido a toda España.",
  },
};

export default async function HomePage() {
  const [config, maxDiscount] = await Promise.all([
    getStoreConfig(),
    getMaxDiscountPercentage(),
  ]);

  const featuredCategories = await prisma.category.findMany({
    where: { isFeatured: true },
    take: 4,
    orderBy: { featuredAt: "desc" },
    include: {
      products: {
        take: 1,
        orderBy: { createdAt: "desc" },
        include: { images: { take: 1 } },
      },
    },
  });

  return (
    <main className="flex min-h-screen flex-col">
      <HeroSection config={config} />
      {featuredCategories.length > 0 && (
        <FeaturedGrid categories={featuredCategories} />
      )}
      <SaleBanner config={config} maxDiscount={maxDiscount} />
      <InterestSection />
    </main>
  );
}
