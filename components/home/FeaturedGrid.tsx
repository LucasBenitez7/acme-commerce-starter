"use client";

import { motion } from "framer-motion";
import Image from "next/image";
import Link from "next/link";

import { homeConfig } from "@/lib/home-config";

export default function FeaturedGrid() {
  const { featuredCollections } = homeConfig;

  return (
    <section className="relative w-full bg-background">
      {/* GRID */}
      <div className="grid w-full grid-cols-1 md:grid-cols-2 py-0.5">
        {featuredCollections.slice(0, 4).map((item, index) => (
          <motion.div
            key={`${item.title}-${index}`}
            initial={{ opacity: 0 }}
            whileInView={{ opacity: 1 }}
            transition={{ duration: 0.5, delay: index * 0.1 }}
            viewport={{ once: true }}
            className="group relative aspect-[4/5] md:aspect-[4/3] w-full overflow-hidden cursor-pointer"
          >
            <Link href={item.link} className="block size-full">
              {/* IMAGE */}
              <div className="absolute inset-0 size-full">
                <Image
                  src={item.src}
                  alt={item.title}
                  fill
                  priority={index < 2}
                  className="object-cover"
                  sizes="(max-width: 768px) 100vw, 50vw"
                  style={{
                    objectPosition: (item as any).objectPosition || "center",
                  }}
                />
              </div>

              {/* TEXT (Bottom Center) */}
              <div className="absolute bottom-0 left-0 flex flex-col items-center justify-end p-6 pb-6 text-center text-background">
                <h3 className="text-lg md:text-2xl font-semibold uppercase sm:text-xl font-heading underline sm:no-underline sm:hover:underline underline-offset-4">
                  {item.title}
                </h3>
              </div>
            </Link>
          </motion.div>
        ))}
      </div>
    </section>
  );
}
