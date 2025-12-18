"use client";

import { useRouter, useSearchParams } from "next/navigation";
import { useState, useEffect } from "react";
import { FaFilter, FaMagnifyingGlass, FaSort, FaXmark } from "react-icons/fa6";

import { Button, Input } from "@/components/ui";
import {
  Popover,
  PopoverContent,
  PopoverTrigger,
} from "@/components/ui/popover";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";

import { cn } from "@/lib/utils";

export function CategoryListToolbar() {
  const router = useRouter();
  const searchParams = useSearchParams();

  // Estados locales
  const [query, setQuery] = useState(searchParams.get("q") || "");
  const currentFilter = searchParams.get("filter") || "all";
  const currentSortKey = `${searchParams.get("sortBy") || "sort"}-${searchParams.get("sortOrder") || "asc"}`;

  // Sincronizar query si cambia URL
  useEffect(() => {
    setQuery(searchParams.get("q") || "");
  }, [searchParams]);

  // Debounce para búsqueda
  useEffect(() => {
    const timer = setTimeout(() => {
      if (query !== (searchParams.get("q") || "")) {
        updateParams({ q: query || null });
      }
    }, 500);
    return () => clearTimeout(timer);
  }, [query]);

  const updateParams = (updates: Record<string, string | null>) => {
    const params = new URLSearchParams(searchParams.toString());
    Object.entries(updates).forEach(([key, value]) => {
      if (value) params.set(key, value);
      else params.delete(key);
    });
    router.replace(`?${params.toString()}`);
  };

  const handleSortChange = (value: string) => {
    const [field, order] = value.split("-");
    updateParams({ sortBy: field, sortOrder: order });
  };

  const clearAll = () => {
    setQuery("");
    router.push("/admin/categories");
  };

  const hasActiveFilters = currentFilter !== "all" || !!query;

  return (
    <div className="flex flex-col sm:flex-row gap-3 w-full justify-between">
      {/* 1. BUSCADOR */}
      <div className="relative flex-1 max-w-sm">
        <FaMagnifyingGlass className="absolute left-3 top-1/2 -translate-y-1/2 text-muted-foreground h-4 w-4" />
        <Input
          placeholder="Buscar categoría..."
          className="pl-9 h-9 bg-white"
          value={query}
          onChange={(e) => setQuery(e.target.value)}
        />
        {query && (
          <button
            onClick={() => setQuery("")}
            className="absolute right-3 top-1/2 -translate-y-1/2 text-muted-foreground hover:text-foreground"
          >
            <FaXmark className="h-3 w-3" />
          </button>
        )}
      </div>

      <div className="flex items-center gap-2 overflow-x-auto">
        {/* 2. FILTROS */}
        <Popover>
          <PopoverTrigger asChild>
            <Button
              variant="outline"
              size="sm"
              className={cn(
                "h-9 border-dashed",
                currentFilter !== "all" &&
                  "bg-neutral-100 border-neutral-400 text-neutral-900",
              )}
            >
              <FaFilter className="mr-2 h-3.5 w-3.5" />
              Filtrar
              {currentFilter !== "all" && (
                <div className="ml-1.5 h-2 w-2 rounded-full bg-neutral-900" />
              )}
            </Button>
          </PopoverTrigger>
          <PopoverContent className="w-[200px] p-0" align="end">
            <div className="p-2 space-y-1">
              <div
                onClick={() => updateParams({ filter: "all" })}
                className={cn(
                  "px-2 py-1.5 text-sm rounded cursor-pointer hover:bg-neutral-50",
                  currentFilter === "all" && "font-medium bg-neutral-100",
                )}
              >
                Todas
              </div>
              <div
                onClick={() => updateParams({ filter: "with_products" })}
                className={cn(
                  "px-2 py-1.5 text-sm rounded cursor-pointer hover:bg-neutral-50",
                  currentFilter === "with_products" &&
                    "font-medium bg-neutral-100",
                )}
              >
                Con productos
              </div>
              <div
                onClick={() => updateParams({ filter: "empty" })}
                className={cn(
                  "px-2 py-1.5 text-sm rounded cursor-pointer hover:bg-neutral-50",
                  currentFilter === "empty" && "font-medium bg-neutral-100",
                )}
              >
                Vacías
              </div>
            </div>
          </PopoverContent>
        </Popover>

        {/* 3. ORDENAR */}
        <Select value={currentSortKey} onValueChange={handleSortChange}>
          <SelectTrigger className="h-9 w-[180px] text-xs font-medium border-dashed focus:ring-0 bg-transparent">
            <div className="flex items-center gap-2 text-muted-foreground">
              <FaSort />
              <span className="text-foreground">
                <SelectValue />
              </span>
            </div>
          </SelectTrigger>
          <SelectContent align="end">
            <SelectItem value="sort-asc">Orden Manual (0-9)</SelectItem>
            <SelectItem value="name-asc">Nombre (A-Z)</SelectItem>
            <SelectItem value="name-desc">Nombre (Z-A)</SelectItem>
            <SelectItem value="products-desc">Más productos</SelectItem>
            <SelectItem value="products-asc">Menos productos</SelectItem>
            <SelectItem value="createdAt-desc">Más recientes</SelectItem>
          </SelectContent>
        </Select>

        {/* LIMPIAR */}
        {hasActiveFilters && (
          <Button
            variant="ghost"
            size="icon"
            onClick={clearAll}
            className="h-9 w-9 text-muted-foreground hover:text-red-600 hover:bg-red-50"
          >
            <FaXmark className="h-4 w-4" />
          </Button>
        )}
      </div>
    </div>
  );
}
