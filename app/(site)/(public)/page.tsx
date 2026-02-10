import FeaturedGrid from "@/components/home/FeaturedGrid";
import HeroSection from "@/components/home/HeroSection";
import InterestSection from "@/components/home/InterestSection";
import SaleBanner from "@/components/home/SaleBanner";

import { prisma } from "@/lib/db";
import { getMaxDiscountPercentage } from "@/lib/products/queries";
import { getStoreConfig } from "@/lib/settings/service";

export const dynamic = "force-dynamic";

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
