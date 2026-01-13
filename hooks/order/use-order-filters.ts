"use client";

import { usePathname, useRouter, useSearchParams } from "next/navigation";
import { useCallback, useEffect, useState } from "react";

import { useDebounce } from "@/hooks/common/use-debounce";

import type { OrderStatus } from "@prisma/client";

export function useOrderFilters() {
  const router = useRouter();
  const pathname = usePathname();
  const searchParams = useSearchParams();

  const activeStatusParam = searchParams.get("status_filter");
  const activeSort = searchParams.get("sort") || "date_desc";
  const initialQuery = searchParams.get("query")?.toString() || "";

  const activeStatuses = activeStatusParam
    ? (activeStatusParam.split(",") as OrderStatus[])
    : [];

  const [searchQuery, setSearchQuery] = useState(initialQuery);
  const debouncedQuery = useDebounce(searchQuery, 500);

  const updateParams = useCallback(
    (newParams: Record<string, string | null | undefined>) => {
      const params = new URLSearchParams(searchParams.toString());

      Object.entries(newParams).forEach(([key, value]) => {
        if (value === null || value === undefined || value === "") {
          params.delete(key);
        } else {
          params.set(key, value);
        }
      });

      if (newParams.page === undefined) {
        params.delete("page");
      }

      router.push(`${pathname}?${params.toString()}`, { scroll: false });
    },
    [searchParams, pathname, router],
  );

  // --- EFECTO DE BÚSQUEDA ---
  useEffect(() => {
    if (debouncedQuery !== initialQuery) {
      updateParams({ query: debouncedQuery });
    }
  }, [debouncedQuery, updateParams, initialQuery]);

  // --- HANDLERS ---
  const toggleStatus = (status: string) => {
    const current = new Set(activeStatuses);
    if (current.has(status as OrderStatus)) {
      current.delete(status as OrderStatus);
    } else {
      current.add(status as OrderStatus);
    }

    const value = Array.from(current).join(",") || null;
    updateParams({ status_filter: value });
  };

  return {
    // Estado
    activeSort,
    activeStatuses,
    searchQuery,

    // Acciones
    setSearchQuery,
    toggleStatus,
    updateParams,
  };
}
