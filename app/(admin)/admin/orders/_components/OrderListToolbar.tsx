"use client";

import { FaFilter, FaSort, FaXmark } from "react-icons/fa6";

import { Button } from "@/components/ui/button";
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

import {
  FILTER_STATUS_OPTIONS,
  ORDER_SORT_OPTIONS,
} from "@/lib/orders/constants";
import { cn } from "@/lib/utils";

import { useOrderFilters } from "@/hooks/order/use-order-filters";

export function OrderListToolbar() {
  const { activeSort, activeStatuses, updateParams, toggleStatus } =
    useOrderFilters();

  return (
    <div className="flex flex-wrap items-center gap-2">
      {/* 1. FILTRO ESTADOS (POPOVER MULTI-SELECT) */}
      <Popover>
        <PopoverTrigger asChild>
          <Button variant="outline" size="sm" className="h-8 border-dashed">
            <FaFilter className="size-3.5" />
            Estados
            {activeStatuses.length > 0 && (
              <span className="ml-1.5 rounded-full bg-black px-1.5 py-0.5 text-[10px] font-semibold text-white">
                {activeStatuses.length}
              </span>
            )}
          </Button>
        </PopoverTrigger>
        <PopoverContent className="w-[300px] p-4" align="start">
          <div className="space-y-4">
            <div className="flex items-center justify-between">
              <h4 className="font-medium leading-none">Filtrar por Estado</h4>
              {activeStatuses.length > 0 && (
                <button
                  onClick={() => updateParams({ status_filter: null })}
                  className="text-xs text-muted-foreground hover:text-red-600 flex items-center gap-1"
                >
                  <FaXmark /> Limpiar
                </button>
              )}
            </div>

            <div className="grid grid-cols-2 gap-2">
              {FILTER_STATUS_OPTIONS.map((status) => {
                const isSelected = activeStatuses.includes(status.value);
                return (
                  <div
                    key={status.value}
                    onClick={() => toggleStatus(status.value)}
                    className={cn(
                      "cursor-pointer flex items-center gap-2 p-2 rounded border text-xs transition-all select-none group",
                      isSelected
                        ? "bg-white border-black ring-1 ring-black shadow-sm z-10"
                        : "bg-white border-neutral-200 hover:border-blue-400",
                    )}
                  >
                    {/* Indicador visual redondo */}
                    <div
                      className={cn(
                        "h-3 w-3 rounded-full flex items-center justify-center shrink-0",
                        status.color,
                        isSelected ? "ring-2 ring-offset-1 ring-black" : "",
                      )}
                    />
                    <span
                      className={cn("truncate", isSelected && "font-medium")}
                    >
                      {status.label}
                    </span>
                  </div>
                );
              })}
            </div>
          </div>
        </PopoverContent>
      </Popover>

      <div className="flex-1" />

      {/* 2. ORDENAR (SELECT SINGLE) */}
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
          {ORDER_SORT_OPTIONS.map((option) => (
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
