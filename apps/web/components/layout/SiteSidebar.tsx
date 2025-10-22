"use client";

import Link from "next/link";
import { useSearchParams } from "next/navigation";

import { cn } from "@/lib/utils";

const CATEGORIES = [
  { slug: "remeras", label: "Remeras" },
  { slug: "pantalones", label: "Pantalones" },
  { slug: "camperas", label: "Camperas" },
  { slug: "zapatillas", label: "Zapatillas" },
];

export default function SiteSidebar() {
  const sp = useSearchParams();
  const activeCat = sp.get("cat") ?? "";

  return (
    <aside>
      <div className="pl-8">
        <h2 className="text-sm font-medium text-neutral-500 mt-2">
          Categorías
        </h2>
        <ul className="mt-2 space-y-2 text-sm">
          {CATEGORIES.map((c) => {
            const isActive = c.slug === activeCat;

            return (
              <li key={c.slug}>
                {/* Importante: sin `page` → resetea a 1 */}
                <Link
                  href={`/?cat=${c.slug}`}
                  prefetch={false}
                  aria-current={isActive ? "page" : undefined}
                  className={cn(
                    "block rounded ml-2 px-2 py-1 hover:bg-neutral-100",
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
      {/* más secciones (tallas, precio, etc.) cuando quieras */}
    </aside>
  );
}
