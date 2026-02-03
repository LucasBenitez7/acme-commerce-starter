import FeaturedGrid from "@/components/home/FeaturedGrid";
import HeroSection from "@/components/home/HeroSection";
import InterestSection from "@/components/home/InterestSection";
import SaleBanner from "@/components/home/SaleBanner";

export const dynamic = "force-dynamic";

export default function HomePage() {
  return (
    <main className="flex min-h-screen flex-col">
      <HeroSection />
      <FeaturedGrid />
      <SaleBanner />
      <InterestSection />
    </main>
  );
}
