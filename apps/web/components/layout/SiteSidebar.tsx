"use client";

import Link from "next/link";
import { usePathname, useSearchParams } from "next/navigation";

import { cn } from "@/lib/utils";

type Cat = { slug: string; label: string };

export default function SiteSidebar({ categories }: { categories: Cat[] }) {
  const pathname = usePathname();
  const sp = useSearchParams();

  const [, section = "", sub = ""] = pathname.split("/");

  const catFromPath = section === "cat" ? sub : "";
  const catFromQuery = sp.get("cat") ?? "";
  const currentCat = catFromPath || catFromQuery;

  const isNovedades = pathname === "/novedades";
  const isPromociones = pathname === "/promociones";
  const isCatalogoAll = section === "catalogo" && !currentCat;

  return (
    <aside>
      <div className="px-6 flex flex-col">
        <div className="flex flex-col pb-4 pt-1 space-y-2">
          <Link
            href="/novedades"
            prefetch={false}
            aria-current={isNovedades ? "page" : undefined}
            className={cn(
              "fx-underline-anim w-max text-2xl font-medium pt-1",
              isNovedades && "fx-underline-anim-active",
            )}
          >
            Novedades
          </Link>
          <Link
            href="/promociones"
            prefetch={false}
            aria-current={isPromociones ? "page" : undefined}
            className={cn(
              "fx-underline-anim w-max text-2xl font-medium pt-1",
              isPromociones && "fx-underline-anim-active",
            )}
          >
            Promociones
          </Link>
        </div>

        <ul className="h-full text-base space-y-2">
          {/* Enlace sintético arriba de todo */}
          <li key="all">
            <Link
              href="/catalogo"
              prefetch={false}
              aria-current={isCatalogoAll ? "page" : undefined}
              className={cn(
                "fx-underline-anim",
                isCatalogoAll && "fx-underline-anim-active",
              )}
            >
              Todas las prendas
            </Link>
          </li>

          {categories.map((c: Cat) => {
            const isActive = currentCat === c.slug;
            return (
              <li key={c.slug}>
                <Link
                  href={`/cat/${c.slug}`}
                  prefetch={false}
                  aria-current={isActive ? "page" : undefined}
                  className={cn(
                    "fx-underline-anim",
                    isActive && "fx-underline-anim-active",
                  )}
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
