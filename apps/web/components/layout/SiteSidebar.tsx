"use client";

import Link from "next/link";
import { usePathname, useSearchParams } from "next/navigation";

import { cn } from "@/lib/utils";

type Cat = { slug: string; label: string };

export default function SiteSidebar({ categories }: { categories: Cat[] }) {
  const sp = useSearchParams();
  const pathname = usePathname();

  const fromPath = pathname?.startsWith("/cat/")
    ? (pathname.split("/")[2] ?? "")
    : "";
  const fromQuery = sp.get("cat") ?? "";
  const activeCat = fromPath || fromQuery || "";
  const isAllActive = pathname === "/catalogo";

  return (
    <aside>
      <div className="pl-7">
        <ul className="mt-3 space-y-3 text-sm">
          {/* Enlace sintético arriba de todo */}
          <li key="all">
            <Link
              href="/catalogo"
              prefetch={false}
              aria-current={isAllActive ? "page" : undefined}
              className={cn(
                "block rounded px-2 py-1 hover:bg-neutral-100",
                isAllActive && "bg-neutral-200 font-medium",
              )}
            >
              Todas las prendas
            </Link>
          </li>

          {categories.map((c: Cat) => {
            const isActive = c.slug === activeCat;
            return (
              <li key={c.slug}>
                {/* Canonical de categoría */}
                <Link
                  href={`/cat/${c.slug}`}
                  prefetch={false}
                  aria-current={isActive ? "page" : undefined}
                  className={cn(
                    "block rounded px-2 py-1 hover:bg-neutral-100",
                    isActive && "bg-neutral-200 font-medium",
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
