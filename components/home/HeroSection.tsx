"use client";

import { motion, AnimatePresence } from "framer-motion";
import Image from "next/image";
import Link from "next/link";
import { useState } from "react";

import { Button } from "@/components/ui/button";

import { homeConfig } from "@/lib/home-config";

import type { StoreConfig } from "@prisma/client";

interface Props {
  config: StoreConfig | null;
}

export default function HeroSection({ config }: Props) {
  const [isLoaded, setIsLoaded] = useState(false);

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

  const handleImageLoad = () => setIsLoaded(true);

  return (
    <section className="relative h-[95vh] w-full overflow-hidden mb-[-1px]">
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
            sizes="(max-width: 767px) 100vw, 1px"
            onLoad={handleImageLoad}
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
            sizes="(min-width: 768px) 100vw, 1px"
            onLoad={handleImageLoad}
          />
        </div>

        {/* OVERLAY */}
        <div
          className="absolute inset-0 bg-black/20"
          style={{ opacity: isLoaded ? hero.overlayOpacity : 0 }}
        />
      </div>

      {/* CONTENT */}
      <div className="relative z-10 flex h-full flex-col items-center justify-center px-4 text-center text-white sm:px-6 lg:px-8">
        <AnimatePresence>
          {isLoaded && (
            <motion.div
              initial={{ opacity: 0, y: 30 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -30 }}
              transition={{ duration: 0.8, ease: "easeOut" }}
              className="max-w-3xl space-y-6"
            >
              <h1 className="text-4xl font-bold tracking-wide sm:text-5xl lg:text-6xl text-white">
                {hero.title}
              </h1>
              {hero.subtitle && (
                <p className="mt-2 mb-6 text-lg text-white sm:text-xl md:text-2xl font-normal opacity-90">
                  {hero.subtitle}
                </p>
              )}
              <div className="flex justify-center gap-4">
                <Button
                  asChild
                  className="bg-white text-foreground hover:bg-neutral-200 hover:text-foreground rounded-none px-8 h-12 text-base font-medium tracking-wider transition-all duration-300"
                >
                  <Link href={hero.ctaLink}>VER NOVEDADES</Link>
                </Button>
              </div>
            </motion.div>
          )}
        </AnimatePresence>
      </div>
    </section>
  );
}
