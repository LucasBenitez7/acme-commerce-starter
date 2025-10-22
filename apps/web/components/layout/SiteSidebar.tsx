"use client";

import Link from "next/link";

const CATEGORIES = [
  { slug: "remeras", label: "Remeras" },
  { slug: "pantalones", label: "Pantalones" },
  { slug: "camperas", label: "Camperas" },
  { slug: "zapatillas", label: "Zapatillas" },
];

export default function SiteSidebar() {
  return (
    <aside>
      <div className="pl-8">
        <h2 className="text-sm font-medium text-neutral-500 mt-2">
          Categorías
        </h2>
        <ul className="mt-2 space-y-2 text-sm">
          {CATEGORIES.map((c) => (
            <li key={c.slug}>
              <Link
                href={`/?cat=${c.slug}`}
                className="block rounded ml-2 hover:bg-neutral-100"
              >
                {c.label}
              </Link>
            </li>
          ))}
        </ul>
      </div>

      {/* aquí más secciones (tallas, precio, etc.) cuando quieras */}
    </aside>
  );
}
