"use client";

import Link from "next/link";
import { useSearchParams } from "next/navigation";

import { cn } from "@/lib/utils";

export type Cat = { slug: string; label: string };

export default function SiteSidebar({ categories }: { categories: Cat[] }) {
  const sp = useSearchParams();
  const activeCat = sp.get("cat") ?? "";

  return (
    <aside>
      <div className="pl-7">
        <ul className="mt-3 space-y-3 text-sm">
          {categories.map((c) => {
            const isActive = c.slug === activeCat;
            return (
              <li key={c.slug}>
                {/* Importante: sin `page` → resetea a 1 */}
                <Link
                  href={`/?cat=${c.slug}`}
                  prefetch={false}
                  aria-current={isActive ? "page" : undefined}
                  className={cn(
                    "block rounded hover:bg-neutral-100",
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
