"use client";

import { motion } from "framer-motion";
import Image from "next/image";
import Link from "next/link";

import { Button } from "@/components/ui/button";

import { homeConfig } from "@/lib/home-config";

import type { StoreConfig } from "@prisma/client";

interface Props {
  config: StoreConfig | null;
}

export default function HeroSection({ config }: Props) {
  const hero = {
    desktopSrc: config?.heroImage || homeConfig.hero.src,
    mobileSrc:
      config?.heroMobileImage || config?.heroImage || homeConfig.hero.src,
    title: config?.heroTitle || "",
    subtitle: config?.heroSubtitle || "",
    ctaText: "VER NOVEDADES",
    ctaLink: config?.heroLink || "/novedades",
    overlayOpacity: homeConfig.hero.overlayOpacity,
  };

  return (
    <section className="relative h-[95vh] w-full overflow-hidden">
      {/* BACKGROUND MEDIA */}
      <div className="absolute inset-0 size-full">
        {/* Mobile Image */}
        <div className="block md:hidden size-full relative">
          <Image
            src={hero.mobileSrc}
            alt="Hero Background Mobile"
            fill
            priority
            className="object-cover"
            sizes="100vw"
          />
        </div>

        {/* Desktop Image */}
        <div className="hidden md:block size-full relative">
          <Image
            src={hero.desktopSrc}
            alt="Hero Background Desktop"
            fill
            priority
            className="object-cover"
            sizes="100vw"
          />
        </div>

        {/* OVERLAY */}
        <div
          className="absolute inset-0"
          style={{ opacity: hero.overlayOpacity }}
        />
      </div>

      {/* CONTENT */}
      <div className="relative z-10 flex h-full flex-col items-center justify-center px-4 text-center text-white sm:px-6 lg:px-8">
        <motion.div
          initial={{ opacity: 0, y: 30 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.8, ease: "easeOut" }}
          className="max-w-3xl"
        >
          <h1 className="text-4xl font-bold tracking-wide sm:text-5xl lg:text-6xl text-background">
            {hero.title}
          </h1>
          <p className="mt-2 mb-6 text-lg text-background sm:text-xl md:text-2xl font-normal">
            {hero.subtitle}
          </p>
          <div className="flex justify-center gap-4">
            <Button
              asChild
              className="bg-white text-foreground hover:bg-neutral-200 hover:text-foreground rounded-none px-8 h-12 text-base font-medium tracking-wider transition-all duration-300"
            >
              <Link href={hero.ctaLink}>VER NOVEDADES</Link>
            </Button>
          </div>
        </motion.div>
      </div>
    </section>
  );
}
