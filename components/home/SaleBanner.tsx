"use client";

import Image from "next/image";
import Link from "next/link";

import { Button } from "@/components/ui/button";

import { homeConfig } from "@/lib/home-config";

export default function SaleBanner() {
  const { saleBanner } = homeConfig;

  return (
    <section className="relative w-full py-24 h-[95vh] flex items-center justify-center text-center overflow-hidden">
      {/* Background Image */}
      {saleBanner.backgroundImage ? (
        <div className="absolute inset-0 size-full">
          <Image
            src={saleBanner.backgroundImage}
            alt="Sale Background"
            fill
            className="object-cover"
          />
          <div className="absolute inset-0 bg-black/20" />
        </div>
      ) : (
        <div
          className="absolute inset-0 size-full"
          style={{ backgroundColor: saleBanner.backgroundColor }}
        />
      )}

      {/* Content */}
      <div className="relative z-10 max-w-4xl px-4 text-red-600">
        <h2 className="text-4xl font-medium sm:text-5xl lg:text-8xl uppercase">
          {saleBanner.title}
        </h2>
        <p className="my-2 text-lg font-normal sm:text-2xl">
          {saleBanner.subtitle}
        </p>
        <p className="mb-6 text-4xl font-medium sm:text-8xl">
          {saleBanner.subtitle2}
        </p>
        <Button
          asChild
          variant="outline"
          size="lg"
          className="border-red-600 bg-red-600 hover:bg-red-500 text-white border-none transition-all duration-300 rounded-none px-8 h-11"
        >
          <Link href={saleBanner.ctaLink}>{saleBanner.ctaText}</Link>
        </Button>
      </div>
      <p className="mb-4 mt-2 text-sm font-normal bottom-0 absolute z-20 text-red-600">
        {saleBanner.subtitle3}
      </p>
    </section>
  );
}
