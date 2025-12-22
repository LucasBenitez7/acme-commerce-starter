"use client";

import { useRouter, useSearchParams } from "next/navigation";
import { useState, useEffect, useCallback } from "react";
import {
  FaFilter,
  FaSort,
  FaXmark,
  FaEuroSign,
  FaMagnifyingGlass,
  FaCheck,
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
import { Separator } from "@/components/ui/separator";

import { cn } from "@/lib/utils";

import { useDebounce } from "@/hooks/common/use-debounce";

type Category = { id: string; name: string };

type Props = {
  categories: Category[];
};

export function ProductListToolbar({ categories }: Props) {
  const router = useRouter();
  const searchParams = useSearchParams();

  // --- LÓGICA DE URL ---
  const updateParams = useCallback(
    (updates: Record<string, string | null>) => {
      const params = new URLSearchParams(searchParams.toString());

      Object.entries(updates).forEach(([key, value]) => {
        if (value) params.set(key, value);
        else params.delete(key);
      });

      // Si cambiamos filtros (no página), reseteamos a página 1
      if (updates.page === undefined) params.set("page", "1");

      router.push(`/admin/products?${params.toString()}`);
    },
    [searchParams, router],
  );

  // --- ESTADOS LOCALES ---
  // 1. Buscador
  const [query, setQuery] = useState(searchParams.get("q") || "");
  const debouncedQuery = useDebounce(query, 500); // Hook propio

  // 2. Filtros
  const activeSort = searchParams.get("sort") || "date_desc";
  const activeCats =
    searchParams.get("categories")?.split(",").filter(Boolean) || [];

  const [minPrice, setMinPrice] = useState(searchParams.get("min") || "");
  const [maxPrice, setMaxPrice] = useState(searchParams.get("max") || "");
  const [priceOpen, setPriceOpen] = useState(false);

  // --- EFECTOS ---

  // A. Sincronizar Input -> URL (con Debounce)
  useEffect(() => {
    if (debouncedQuery !== (searchParams.get("q") || "")) {
      updateParams({ q: debouncedQuery || null });
    }
  }, [debouncedQuery, updateParams, searchParams]);

  // B. Sincronizar URL -> Input (por si navegamos atrás/adelante)
  useEffect(() => {
    if (searchParams.get("q") !== query) {
      setQuery(searchParams.get("q") || "");
    }
    if (searchParams.get("min") !== minPrice)
      setMinPrice(searchParams.get("min") || "");
    if (searchParams.get("max") !== maxPrice)
      setMaxPrice(searchParams.get("max") || "");
  }, [searchParams]);

  // --- HANDLERS ---
  const handleSortChange = (val: string) => updateParams({ sort: val });

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

  const PRODUCT_SORT_OPTIONS = [
    { label: "Más recientes", value: "date_desc" },
    { label: "Más antiguos", value: "date_asc" },
    { label: "Precio: Bajo a Alto", value: "price_asc" },
    { label: "Precio: Alto a Bajo", value: "price_desc" },
    { label: "Nombre: A-Z", value: "name_asc" },
    { label: "Nombre: Z-A", value: "name_desc" },
    { label: "Stock: Bajo", value: "stock_asc" },
    { label: "Stock: Alto", value: "stock_desc" },
  ] as const;

  return (
    <div className="space-y-4 w-full bg-white p-4 rounded-lg border shadow-sm">
      <div className="flex flex-col lg:flex-row gap-4 justify-between w-full items-start lg:items-center">
        {/* 1. BUSCADOR */}
        <div className="relative w-full lg:max-w-md">
          <FaMagnifyingGlass className="absolute left-3 top-1/2 -translate-y-1/2 text-muted-foreground h-4 w-4" />
          <Input
            placeholder="Buscar por nombre, descripción..."
            className="pl-9 bg-neutral-50 border-neutral-200 focus:bg-white transition-colors"
            value={query}
            onChange={(e) => setQuery(e.target.value)}
          />
        </div>

        {/* 2. BARRA DE HERRAMIENTAS */}
        <div className="flex flex-wrap gap-2 w-full lg:w-auto items-center">
          {/* SORT (Usando Constantes) */}
          <Select value={activeSort} onValueChange={handleSortChange}>
            <SelectTrigger className="w-[180px] h-10 bg-white">
              <div className="flex items-center gap-2 text-muted-foreground">
                <FaSort />{" "}
                <span className="text-foreground">
                  <SelectValue />
                </span>
              </div>
            </SelectTrigger>
            <SelectContent align="end">
              {PRODUCT_SORT_OPTIONS.map((option) => (
                <SelectItem key={option.value} value={option.value}>
                  {option.label}
                </SelectItem>
              ))}
            </SelectContent>
          </Select>

          {/* PRECIO (Popover) */}
          <Popover open={priceOpen} onOpenChange={setPriceOpen}>
            <PopoverTrigger asChild>
              <Button
                variant="outline"
                className={cn(
                  "h-10 border-dashed",
                  hasPriceFilter && "border-solid border-black bg-neutral-50",
                )}
              >
                <FaEuroSign className="mr-2 h-3.5 w-3.5" />
                Precio
              </Button>
            </PopoverTrigger>
            <PopoverContent className="w-80 p-4" align="end">
              <div className="space-y-4">
                <h4 className="font-medium leading-none">Rango de Precio</h4>
                <div className="flex items-center gap-2">
                  <div className="grid gap-1.5 flex-1">
                    <Label htmlFor="min">Mín (€)</Label>
                    <Input
                      id="min"
                      type="number"
                      placeholder="0"
                      value={minPrice}
                      onChange={(e) => setMinPrice(e.target.value)}
                    />
                  </div>
                  <span className="mt-6 text-muted-foreground">-</span>
                  <div className="grid gap-1.5 flex-1">
                    <Label htmlFor="max">Máx (€)</Label>
                    <Input
                      id="max"
                      type="number"
                      placeholder="∞"
                      value={maxPrice}
                      onChange={(e) => setMaxPrice(e.target.value)}
                    />
                  </div>
                </div>
                <Button className="w-full" size="sm" onClick={applyPriceFilter}>
                  Aplicar Filtro
                </Button>
              </div>
            </PopoverContent>
          </Popover>

          {/* CATEGORÍAS (Popover Multi-select) */}
          <Popover>
            <PopoverTrigger asChild>
              <Button
                variant="outline"
                className={cn(
                  "h-10 border-dashed",
                  activeCats.length > 0 &&
                    "border-solid border-black bg-neutral-50",
                )}
              >
                <FaFilter className="mr-2 h-3.5 w-3.5" />
                Categorías
                {activeCats.length > 0 && (
                  <span className="ml-1 rounded-full bg-black text-white w-5 h-5 text-[10px] flex items-center justify-center">
                    {activeCats.length}
                  </span>
                )}
              </Button>
            </PopoverTrigger>
            <PopoverContent className="w-[220px] p-0" align="end">
              <div className="p-2 max-h-[300px] overflow-y-auto">
                {categories.map((cat) => {
                  const isActive = activeCats.includes(cat.id);
                  return (
                    <div
                      key={cat.id}
                      className={cn(
                        "flex items-center gap-2 px-2 py-1.5 rounded-sm cursor-pointer hover:bg-neutral-100 text-sm select-none",
                        isActive && "bg-neutral-50 font-medium",
                      )}
                      onClick={() => handleCategoryToggle(cat.id)}
                    >
                      <div
                        className={cn(
                          "w-4 h-4 border rounded-sm flex items-center justify-center transition-colors",
                          isActive
                            ? "bg-black border-black text-white"
                            : "border-neutral-300",
                        )}
                      >
                        {isActive && <FaCheck className="w-2.5 h-2.5" />}
                      </div>
                      {cat.name}
                    </div>
                  );
                })}
                {categories.length === 0 && (
                  <div className="p-2 text-xs text-muted-foreground text-center">
                    No hay categorías creadas
                  </div>
                )}
              </div>
            </PopoverContent>
          </Popover>

          {/* LIMPIAR */}
          {hasActiveFilters && (
            <Button
              variant="ghost"
              onClick={clearAll}
              className="h-10 px-2 text-red-600 hover:text-red-700 hover:bg-red-50"
            >
              <FaXmark className="mr-2" />
              Limpiar
            </Button>
          )}
        </div>
      </div>

      {/* 3. TAGS VISUALES (UX: Feedback de filtros activos) */}
      {hasActiveFilters && (
        <div className="flex flex-wrap gap-2 pt-2 border-t mt-2 animate-in fade-in slide-in-from-top-1">
          {activeCats.map((catId) => {
            const catName = categories.find((c) => c.id === catId)?.name;
            return (
              <span
                key={catId}
                className="text-xs bg-neutral-100 text-neutral-800 px-2 py-1 rounded-md flex items-center gap-1 border border-neutral-200"
              >
                {catName}
                <button
                  onClick={() => handleCategoryToggle(catId)}
                  className="hover:text-red-500 ml-1"
                >
                  <FaXmark />
                </button>
              </span>
            );
          })}
          {(minPrice || maxPrice) && (
            <span className="text-xs bg-neutral-100 text-neutral-800 px-2 py-1 rounded-md flex items-center gap-1 border border-neutral-200">
              {minPrice || "0"}€ - {maxPrice || "∞"}€
              <button
                onClick={() => {
                  setMinPrice("");
                  setMaxPrice("");
                  updateParams({ min: null, max: null });
                }}
                className="hover:text-red-500 ml-1"
              >
                <FaXmark />
              </button>
            </span>
          )}
        </div>
      )}
    </div>
  );
}
