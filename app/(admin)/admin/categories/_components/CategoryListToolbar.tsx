"use client";

import { useRouter, useSearchParams } from "next/navigation";
import { useState, useEffect, useCallback } from "react";
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

import { useDebounce } from "@/hooks/common/use-debounce";

export function CategoryListToolbar() {
  const router = useRouter();
  const searchParams = useSearchParams();

  const [query, setQuery] = useState(searchParams.get("q") || "");
  const debouncedQuery = useDebounce(query, 500);

  const currentFilter = searchParams.get("filter") || "all";
  const currentSortKey = `${searchParams.get("sortBy") || "sort"}-${searchParams.get("sortOrder") || "asc"}`;

  const updateParams = useCallback(
    (updates: Record<string, string | null>) => {
      const params = new URLSearchParams(searchParams.toString());

      Object.entries(updates).forEach(([key, value]) => {
        if (value) params.set(key, value);
        else params.delete(key);
      });

      if (updates.page === undefined) {
        params.set("page", "1");
      }

      router.push(`?${params.toString()}`);
    },
    [searchParams, router],
  );

  useEffect(() => {
    if (searchParams.get("q") !== query) {
      setQuery(searchParams.get("q") || "");
    }
  }, [searchParams]);

  useEffect(() => {
    if (debouncedQuery !== (searchParams.get("q") || "")) {
      updateParams({ q: debouncedQuery || null });
    }
  }, [debouncedQuery, updateParams, searchParams]);

  const handleSortChange = (value: string) => {
    const [field, order] = value.split("-");
    updateParams({ sortBy: field, sortOrder: order });
  };

  return (
    <div className="flex flex-col sm:flex-row gap-3 w-full justify-between">
      <div className="relative flex-1 lg:w-[300px] w-full">
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
            className="absolute right-1 top-1/2 -translate-y-1/2 text-muted-foreground hover:text-foreground p-1 hover:cursor-pointer"
          >
            <FaXmark className="size-3.5" />
          </button>
        )}
      </div>

      <div className="flex items-center gap-2 overflow-x-auto justify-between">
        <Popover>
          <PopoverTrigger asChild>
            <Button
              variant="outline"
              className={cn(
                "relative border border-border h-9",
                currentFilter !== "all" && "border-foreground",
              )}
            >
              <FaFilter className="size-3.5 text-foreground" size={20} />
              Filtrar
            </Button>
          </PopoverTrigger>
          <PopoverContent
            className="w-[200px] p-0 lg:-translate-x-1/4"
            align="start"
          >
            <div className="py-2 px-1 space-y-1 font-medium">
              <div
                onClick={() => updateParams({ filter: "all" })}
                className={cn(
                  "px-2 py-1.5 text-sm cursor-pointer hover:bg-neutral-100 transition-colors",
                  currentFilter === "all" && "bg-neutral-100",
                )}
              >
                Todas
              </div>
              <div
                onClick={() => updateParams({ filter: "with_products" })}
                className={cn(
                  "px-2 py-1.5 text-sm cursor-pointer hover:bg-neutral-100 transition-colors",
                  currentFilter === "with_products" && "bg-neutral-100",
                )}
              >
                Con productos
              </div>
              <div
                onClick={() => updateParams({ filter: "empty" })}
                className={cn(
                  "px-2 py-1.5 text-sm cursor-pointer hover:bg-neutral-100 transition-colors",
                  currentFilter === "empty" && "bg-neutral-100",
                )}
              >
                Vacías
              </div>
            </div>
          </PopoverContent>
        </Popover>

        {/* 3. ORDENAR */}
        <Select value={currentSortKey} onValueChange={handleSortChange}>
          <SelectTrigger
            showIcon={false}
            className={cn(
              "h-9 w-[170px] text-xs font-medium bg-transparent border-border hover:cursor-pointer focus-none",
              currentSortKey !== "sort-asc" && "border-foreground",
            )}
          >
            <div className="flex items-center gap-2">
              <FaSort className="text-foreground" />
              <span className="text-foreground text-sm">
                <SelectValue />
              </span>
            </div>
          </SelectTrigger>
          <SelectContent align="end">
            <SelectItem value="sort-asc">Orden Manual</SelectItem>
            <SelectItem value="name-asc">Nombre (A-Z)</SelectItem>
            <SelectItem value="name-desc">Nombre (Z-A)</SelectItem>
            <SelectItem value="products-desc">Más productos</SelectItem>
            <SelectItem value="products-asc">Menos productos</SelectItem>
            <SelectItem value="createdAt-desc">Más recientes</SelectItem>
          </SelectContent>
        </Select>
      </div>
    </div>
  );
}
