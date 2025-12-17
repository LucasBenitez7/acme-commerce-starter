"use client";

import { useRouter, useSearchParams } from "next/navigation";
import { useState, useEffect, useRef } from "react";
import {
  FaFilter,
  FaSort,
  FaXmark,
  FaEuroSign,
  FaMagnifyingGlass,
} from "react-icons/fa6";

import { Button, Input, Label } from "@/components/ui";
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

type Category = { id: string; name: string };

type Props = {
  categories: Category[];
};

export function ProductListToolbar({ categories }: Props) {
  const router = useRouter();
  const searchParams = useSearchParams();

  // --- LÓGICA DE URL ---
  const updateParams = (updates: Record<string, string | null>) => {
    const params = new URLSearchParams(searchParams.toString());

    Object.entries(updates).forEach(([key, value]) => {
      if (value) {
        params.set(key, value);
      } else {
        params.delete(key);
      }
    });

    router.push(`/admin/products?${params.toString()}`);
  };

  // --- ESTADOS ---
  const activeSort = searchParams.get("sort") || "date_desc";
  const activeCats =
    searchParams.get("categories")?.split(",").filter(Boolean) || [];

  const [query, setQuery] = useState(searchParams.get("q") || "");

  const [minPrice, setMinPrice] = useState(searchParams.get("min") || "");
  const [maxPrice, setMaxPrice] = useState(searchParams.get("max") || "");
  const [priceOpen, setPriceOpen] = useState(false);

  useEffect(() => {
    setQuery(searchParams.get("q") || "");
    setMinPrice(searchParams.get("min") || "");
    setMaxPrice(searchParams.get("max") || "");
  }, [searchParams]);

  useEffect(() => {
    const timer = setTimeout(() => {
      if (query !== (searchParams.get("q") || "")) {
        updateParams({ q: query || null });
      }
    }, 500);

    return () => clearTimeout(timer);
  }, [query, searchParams]);

  // --- HANDLERS ---
  const handleCategoryToggle = (catId: string) => {
    const newCats = activeCats.includes(catId)
      ? activeCats.filter((id) => id !== catId)
      : [...activeCats, catId];
    updateParams({ categories: newCats.length > 0 ? newCats.join(",") : null });
  };

  const applyPriceFilter = () => {
    updateParams({ min: minPrice || null, max: maxPrice || null });
    setPriceOpen(false);
  };

  const clearAll = () => {
    setQuery("");
    setMinPrice("");
    setMaxPrice("");
    router.push("/admin/products");
  };

  const hasPriceFilter = !!searchParams.get("min") || !!searchParams.get("max");
  const hasActiveFilters = activeCats.length > 0 || hasPriceFilter || !!query;

  const SORT_OPTIONS = [
    { label: "Más recientes", value: "date_desc" },
    { label: "Más antiguos", value: "date_asc" },
    { label: "Precio: Bajo a Alto", value: "price_asc" },
    { label: "Precio: Alto a Bajo", value: "price_desc" },
    { label: "Nombre: A-Z", value: "name_asc" },
    { label: "Nombre: Z-A", value: "name_desc" },
    { label: "Stock: Menos a Más", value: "stock_asc" },
    { label: "Stock: Más a Menos", value: "stock_desc" },
  ];

  return (
    <div className="space-y-3 w-full">
      <div className="flex flex-col sm:flex-row gap-3 justify-between w-full">
        {/* 1. BUSCADOR (Izquierda, expandible) */}
        <div className="relative flex-1 max-w-sm">
          <FaMagnifyingGlass className="absolute left-3 top-1/2 -translate-y-1/2 text-muted-foreground h-4 w-4" />
          <Input
            placeholder="Buscar producto..."
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

        {/* 2. FILTROS Y ORDENACIÓN (Derecha) */}
        <div className="flex items-center gap-2 overflow-x-auto pb-1 sm:pb-0">
          {/* CATEGORÍAS */}
          <Popover>
            <PopoverTrigger asChild>
              <Button
                variant="outline"
                size="sm"
                className={cn(
                  "h-9 border-dashed",
                  activeCats.length > 0 &&
                    "bg-neutral-100 border-neutral-400 text-neutral-900",
                )}
              >
                <FaFilter className="mr-2 h-3.5 w-3.5" />
                Categorías
                {activeCats.length > 0 && (
                  <span className="ml-1.5 rounded-full bg-neutral-900 px-1.5 py-0.5 text-[10px] font-semibold text-neutral-50 leading-none">
                    {activeCats.length}
                  </span>
                )}
              </Button>
            </PopoverTrigger>
            <PopoverContent className="w-[240px] p-0" align="end">
              <div className="p-3 border-b bg-neutral-50/50">
                <h4 className="font-medium text-xs uppercase tracking-wider text-muted-foreground">
                  Filtrar por Categoría
                </h4>
              </div>
              <div className="p-1 max-h-[240px] overflow-y-auto">
                {categories.map((cat) => {
                  const isSelected = activeCats.includes(cat.id);
                  return (
                    <div
                      key={cat.id}
                      onClick={() => handleCategoryToggle(cat.id)}
                      className={cn(
                        "flex items-center gap-2 px-2 py-2 rounded-sm text-sm cursor-pointer transition-colors",
                        isSelected
                          ? "bg-neutral-100 font-medium text-neutral-900"
                          : "text-neutral-600 hover:bg-neutral-50",
                      )}
                    >
                      <div
                        className={cn(
                          "h-4 w-4 border rounded flex items-center justify-center bg-white transition-colors",
                          isSelected
                            ? "bg-neutral-900 border-neutral-900 text-white"
                            : "border-neutral-300",
                        )}
                      >
                        {isSelected && <FaFilter className="h-2 w-2" />}
                      </div>
                      <span>{cat.name}</span>
                    </div>
                  );
                })}
                {categories.length === 0 && (
                  <p className="text-xs text-muted-foreground p-2 text-center">
                    Sin categorías.
                  </p>
                )}
              </div>
            </PopoverContent>
          </Popover>

          {/* PRECIO */}
          <Popover open={priceOpen} onOpenChange={setPriceOpen}>
            <PopoverTrigger asChild>
              <Button
                variant="outline"
                size="sm"
                className={cn(
                  "h-9 border-dashed",
                  hasPriceFilter &&
                    "bg-neutral-100 border-neutral-400 text-neutral-900",
                )}
              >
                <FaEuroSign className="mr-2 h-3.5 w-3.5" />
                Precio
              </Button>
            </PopoverTrigger>
            <PopoverContent className="w-72 p-4" align="end">
              <div className="space-y-4">
                <div className="flex items-center justify-between">
                  <h4 className="font-medium text-sm">Rango de Precio</h4>
                </div>
                <div className="flex items-center gap-2">
                  <Input
                    type="number"
                    placeholder="Min"
                    className="h-8"
                    value={minPrice}
                    onChange={(e) => setMinPrice(e.target.value)}
                  />
                  <span className="text-muted-foreground">-</span>
                  <Input
                    type="number"
                    placeholder="Max"
                    className="h-8"
                    value={maxPrice}
                    onChange={(e) => setMaxPrice(e.target.value)}
                  />
                </div>
                <div className="flex gap-2">
                  <Button
                    variant="outline"
                    size="sm"
                    className="flex-1"
                    onClick={() => {
                      setMinPrice("");
                      setMaxPrice("");
                    }}
                  >
                    Limpiar
                  </Button>
                  <Button
                    size="sm"
                    className="flex-1 bg-black text-white"
                    onClick={applyPriceFilter}
                  >
                    Aplicar
                  </Button>
                </div>
              </div>
            </PopoverContent>
          </Popover>

          {/* ORDENAR */}
          <Select
            value={activeSort}
            onValueChange={(val) => updateParams({ sort: val })}
          >
            <SelectTrigger className="h-9 w-[160px] text-xs font-medium border-dashed focus:ring-0 bg-transparent">
              <div className="flex items-center gap-2 text-muted-foreground">
                <FaSort />
                <span className="text-foreground">
                  <SelectValue />
                </span>
              </div>
            </SelectTrigger>
            <SelectContent align="end">
              {SORT_OPTIONS.map((option) => (
                <SelectItem
                  key={option.value}
                  value={option.value}
                  className="text-xs"
                >
                  {option.label}
                </SelectItem>
              ))}
            </SelectContent>
          </Select>

          {/* BOTÓN LIMPIAR TODO */}
          {hasActiveFilters && (
            <Button
              variant="ghost"
              size="icon"
              onClick={clearAll}
              className="h-9 w-9 text-muted-foreground hover:text-red-600 hover:bg-red-50"
              title="Limpiar todos los filtros"
            >
              <FaXmark className="h-4 w-4" />
            </Button>
          )}
        </div>
      </div>
    </div>
  );
}
