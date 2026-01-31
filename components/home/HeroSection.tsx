"use client";

import { motion } from "framer-motion";
import Image from "next/image";
import Link from "next/link";

import { Button } from "@/components/ui/button";

import { homeConfig } from "@/lib/home-config";

export default function HeroSection() {
  const { hero } = homeConfig;

  return (
    <section className="relative h-[95vh] w-full overflow-hidden bg-black">
      {/* BACKGROUND MEDIA */}
      <div className="absolute inset-0 size-full">
        <Image
          src={hero.src}
          alt="Hero Background"
          fill
          priority
          className="object-cover"
        />
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
              size="lg"
              className="bg-white text-foreground hover:bg-neutral-200 hover:text-foreground rounded-none px-8 h-11 text-base font-medium tracking-wider transition-all duration-300"
            >
              <Link href={hero.ctaLink}>{hero.ctaText}</Link>
            </Button>
          </div>
        </motion.div>
      </div>
    </section>
  );
}
