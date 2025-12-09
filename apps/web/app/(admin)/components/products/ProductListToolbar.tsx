"use client";

import { useRouter, useSearchParams } from "next/navigation";
import { useState, useEffect } from "react";
import { FaFilter, FaSort, FaXmark, FaEuroSign } from "react-icons/fa6";

import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
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

  // --- ESTADOS DE FILTROS ---
  const activeSort = searchParams.get("sort") || "date_desc";
  const activeCats =
    searchParams.get("categories")?.split(",").filter(Boolean) || [];

  // Estado local para inputs de precio
  const [minPrice, setMinPrice] = useState(searchParams.get("min") || "");
  const [maxPrice, setMaxPrice] = useState(searchParams.get("max") || "");
  const [priceOpen, setPriceOpen] = useState(false);

  // Sincronizar inputs si cambia la URL externamente
  useEffect(() => {
    setMinPrice(searchParams.get("min") || "");
    setMaxPrice(searchParams.get("max") || "");
  }, [searchParams]);

  const handleCategoryToggle = (catId: string) => {
    const newCats = activeCats.includes(catId)
      ? activeCats.filter((id) => id !== catId)
      : [...activeCats, catId];

    updateParams({ categories: newCats.length > 0 ? newCats.join(",") : null });
  };

  const applyPriceFilter = () => {
    updateParams({
      min: minPrice || null,
      max: maxPrice || null,
    });
    setPriceOpen(false);
  };

  const clearPriceFilter = () => {
    setMinPrice("");
    setMaxPrice("");
    updateParams({ min: null, max: null });
    setPriceOpen(false);
  };

  const hasPriceFilter = !!searchParams.get("min") || !!searchParams.get("max");

  // Opciones de Ordenación
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
    <div className="flex flex-wrap items-center gap-2">
      {/* 1. FILTRO CATEGORÍAS (POPOVER MULTI-SELECT) */}
      <Popover>
        <PopoverTrigger asChild>
          <Button variant="outline" size="sm" className="h-8 border-dashed">
            <FaFilter className="mr-2 h-3.5 w-3.5" />
            Categorías
            {activeCats.length > 0 && (
              <span className="ml-1.5 rounded-full bg-black px-1.5 py-0.5 text-[10px] font-semibold text-white">
                {activeCats.length}
              </span>
            )}
          </Button>
        </PopoverTrigger>
        <PopoverContent className="w-[340px] p-4" align="start">
          <div className="space-y-4">
            <div className="flex items-center justify-between">
              <h4 className="font-medium leading-none">
                Filtrar por Categoría
              </h4>
              {activeCats.length > 0 && (
                <button
                  onClick={() => updateParams({ categories: null })}
                  className="text-xs text-muted-foreground hover:text-red-600 flex items-center gap-1"
                >
                  <FaXmark /> Limpiar
                </button>
              )}
            </div>

            <div className="grid grid-cols-2 gap-2 max-h-[300px] overflow-y-auto pr-1">
              {categories.map((cat) => {
                const isSelected = activeCats.includes(cat.id);
                return (
                  <div
                    key={cat.id}
                    onClick={() => handleCategoryToggle(cat.id)}
                    className={cn(
                      "cursor-pointer flex items-center gap-2 p-2 rounded border text-xs transition-all select-none group",
                      isSelected
                        ? "bg-white border-black ring-1 ring-black shadow-sm z-10"
                        : "bg-white border-neutral-200 hover:border-blue-400",
                    )}
                  >
                    <div
                      className={cn(
                        "h-3.5 w-3.5 rounded-full border flex items-center justify-center shrink-0 transition-colors",
                        isSelected
                          ? "border-black bg-black"
                          : "border-neutral-300 group-hover:border-blue-400",
                      )}
                    >
                      {isSelected && (
                        <div className="h-1.5 w-1.5 rounded-full bg-white" />
                      )}
                    </div>
                    <span
                      className={cn("truncate", isSelected && "font-medium")}
                    >
                      {cat.name}
                    </span>
                  </div>
                );
              })}

              {categories.length === 0 && (
                <p className="col-span-full text-center text-xs text-muted-foreground py-2">
                  No hay categorías.
                </p>
              )}
            </div>
          </div>
        </PopoverContent>
      </Popover>
      {/* 2. FILTRO PRECIO (POPOVER RANGO) */}
      <Popover open={priceOpen} onOpenChange={setPriceOpen}>
        <PopoverTrigger asChild>
          <Button
            variant="outline"
            size="sm"
            className={cn(
              "h-8 border-dashed",
              hasPriceFilter && "bg-accent/50 border-black/20",
            )}
          >
            <FaEuroSign className="mr-2 h-3.5 w-3.5" />
            Precio
            {hasPriceFilter && (
              <div className="ml-1.5 h-2 w-2 rounded-full bg-green-500" />
            )}
          </Button>
        </PopoverTrigger>
        <PopoverContent className="w-80 p-4" align="start">
          <div className="space-y-4">
            <div className="flex items-center justify-between">
              <h4 className="font-medium leading-none">Rango de Precio</h4>
              {hasPriceFilter && (
                <button
                  onClick={clearPriceFilter}
                  className="text-xs text-muted-foreground hover:text-red-600 flex items-center gap-1"
                >
                  <FaXmark /> Borrar
                </button>
              )}
            </div>

            <div className="flex items-center gap-2">
              <div className="grid gap-1.5 flex-1">
                <Label htmlFor="min-price" className="text-xs">
                  Mínimo (€)
                </Label>
                <Input
                  id="min-price"
                  type="number"
                  placeholder="0"
                  className="h-8"
                  value={minPrice}
                  onChange={(e) => setMinPrice(e.target.value)}
                />
              </div>
              <span className="text-muted-foreground mt-6">-</span>
              <div className="grid gap-1.5 flex-1">
                <Label htmlFor="max-price" className="text-xs">
                  Máximo (€)
                </Label>
                <Input
                  id="max-price"
                  type="number"
                  placeholder="Sin límite"
                  className="h-8"
                  value={maxPrice}
                  onChange={(e) => setMaxPrice(e.target.value)}
                />
              </div>
            </div>

            <Button
              size="sm"
              className="w-full bg-black text-white hover:bg-neutral-800"
              onClick={applyPriceFilter}
            >
              Aplicar Rango
            </Button>
          </div>
        </PopoverContent>
      </Popover>
      <div className="flex-1" /> {/* Espaciador */}
      {/* 3. ORDENAR (SELECT SINGLE) */}
      <Select
        value={activeSort}
        onValueChange={(val) => updateParams({ sort: val })}
      >
        <SelectTrigger className="h-8 w-[180px] text-xs font-medium">
          <div className="flex items-center gap-2">
            <FaSort className="h-3.5 w-3.5 text-muted-foreground" />
            <SelectValue placeholder="Ordenar por" />
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
    </div>
  );
}
