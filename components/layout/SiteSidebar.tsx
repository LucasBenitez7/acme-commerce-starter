"use client";
import Link from "next/link";
import { usePathname } from "next/navigation";

import { cn } from "@/lib/utils";

import type { CategoryLink } from "@/lib/categories/types";

export function SiteSidebar({
  categories,
  maxDiscount,
}: {
  categories: CategoryLink[];
  maxDiscount: number;
}) {
  const pathname = usePathname();

  const isNovedades = pathname === "/novedades";
  const isRebajas = pathname === "/rebajas";
  const isCatalogo = pathname === "/catalogo";

  return (
    <aside>
      <div className="px-6 flex flex-col mt-4">
        <div className="flex flex-col pb-4 mb-4 space-y-2 border-b border-neutral-300">
          <Link
            href="/rebajas"
            prefetch={false}
            aria-current={isRebajas ? "page" : undefined}
            className={cn(
              "fx-underline-anim w-max text-2xl font-semibold pt-1 text-red-600",
            )}
          >
            Rebajas {maxDiscount > 0 && `-${maxDiscount}%`}
          </Link>

          <Link
            href="/novedades"
            prefetch={false}
            aria-current={isNovedades ? "page" : undefined}
            className={cn(
              "fx-underline-anim w-max text-2xl font-semibold pt-1",
            )}
          >
            Novedades
          </Link>
        </div>

        <ul className="h-full text-base space-y-2">
          {/* Enlace sintético arriba de todo */}
          <li key="all">
            <Link
              href="/catalogo"
              prefetch={false}
              aria-current={isCatalogo ? "page" : undefined}
              className={cn("fx-underline-anim")}
            >
              Todas las prendas
            </Link>
          </li>

          {categories.map((c: CategoryLink) => {
            return (
              <li key={c.slug}>
                <Link
                  href={`/cat/${c.slug}`}
                  prefetch={false}
                  className={cn("fx-underline-anim")}
                >
                  {c.label}
                </Link>
              </li>
            );
          })}
        </ul>
      </div>
    </aside>
  );
}
