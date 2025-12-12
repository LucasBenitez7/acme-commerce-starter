"use client";

import { useRouter, useSearchParams } from "next/navigation";
import { useTransition } from "react";

export function CategoryToolbar() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const [isPending, startTransition] = useTransition();

  // Obtener valores actuales de la URL
  const currentFilter = searchParams.get("filter") || "all";
  const currentSort = searchParams.get("sortBy") || "sort";
  const currentOrder = searchParams.get("sortOrder") || "asc";

  function updateParams(key: string, value: string) {
    const params = new URLSearchParams(searchParams.toString());

    if (value === "all" || value === "") {
      params.delete(key);
    } else {
      params.set(key, value);
    }

    startTransition(() => {
      router.replace(`?${params.toString()}`);
    });
  }

  return (
    <div className="flex flex-col sm:flex-row gap-3 w-full sm:w-auto">
      {/* Selector de Filtro */}
      <div className="flex items-center gap-2">
        <select
          disabled={isPending}
          value={currentFilter}
          onChange={(e) => updateParams("filter", e.target.value)}
          className="h-9 rounded-md border border-neutral-200 bg-white px-3 py-1 text-sm shadow-sm focus:border-neutral-900 focus:outline-none focus:ring-1 focus:ring-neutral-900"
        >
          <option value="all">Todas las categorías</option>
          <option value="with_products">Con productos</option>
          <option value="empty">Sin productos (Vacías)</option>
        </select>
      </div>

      {/* Selector de Orden (Alternativa a los headers de la tabla) */}
      <div className="flex items-center gap-2">
        <select
          disabled={isPending}
          value={`${currentSort}-${currentOrder}`}
          onChange={(e) => {
            const [field, order] = e.target.value.split("-");
            const params = new URLSearchParams(searchParams.toString());
            params.set("sortBy", field);
            params.set("sortOrder", order);
            startTransition(() => {
              router.replace(`?${params.toString()}`);
            });
          }}
          className="h-9 rounded-md border border-neutral-200 bg-white px-3 py-1 text-sm shadow-sm focus:border-neutral-900 focus:outline-none focus:ring-1 focus:ring-neutral-900"
        >
          <option value="sort-asc">Orden Manual (0-9)</option>
          <option value="name-asc">Nombre (A-Z)</option>
          <option value="name-desc">Nombre (Z-A)</option>
          <option value="products-desc">Más productos</option>
          <option value="products-asc">Menos productos</option>
          <option value="createdAt-desc">Más recientes</option>
          <option value="createdAt-asc">Más antiguas</option>
        </select>
      </div>
    </div>
  );
}
