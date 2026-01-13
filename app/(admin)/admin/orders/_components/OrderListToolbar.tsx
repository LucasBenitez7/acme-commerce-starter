"use client";

import { useState } from "react";
import {
  FaFilter,
  FaSort,
  FaXmark,
  FaMagnifyingGlass,
  FaCheck,
  FaChevronRight,
} from "react-icons/fa6";

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

import {
  FILTER_STATUS_OPTIONS,
  ORDER_SORT_OPTIONS,
} from "@/lib/orders/constants";
import { cn } from "@/lib/utils";

import { useOrderFilters } from "@/hooks/order/use-order-filters";

import type { OrderStatus } from "@prisma/client";

export function OrderListToolbar() {
  const {
    activeSort,
    activeStatuses,
    searchQuery,
    setSearchQuery,
    updateParams,
    toggleStatus,
  } = useOrderFilters();

  const [isStatusOpen, setIsStatusOpen] = useState(true);

  const hasActiveFilters = activeStatuses.length > 0;

  return (
    <div className="space-y-4 w-full rounded-xs">
      <div className="flex flex-col lg:flex-row gap-3 justify-between w-full items-start lg:items-center">
        <div className="relative min-w-[100px] lg:w-[300px] w-full">
          <FaMagnifyingGlass className="absolute left-3 top-1/2 -translate-y-1/2 text-muted-foreground h-4 w-4" />
          <Input
            placeholder="Buscar por ID, email o nombre..."
            className="pl-9 h-9 bg-background"
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
          />

          {searchQuery && (
            <button
              type="button"
              onClick={() => setSearchQuery("")}
              className="absolute right-1 top-1/2 -translate-y-1/2 text-muted-foreground hover:text-foreground p-1 hover:cursor-pointer"
            >
              <FaXmark className="size-3.5" />
            </button>
          )}
        </div>

        <div className="flex flex-wrap gap-3 justify-between w-full lg:w-auto items-center">
          <Popover>
            <PopoverTrigger asChild>
              <Button
                variant="outline"
                className={cn(
                  "relative border border-border h-9",
                  hasActiveFilters && "border-foreground",
                )}
              >
                <FaFilter className="size-3.5 text-foreground mr-2" />
                Filtrar
              </Button>
            </PopoverTrigger>

            <PopoverContent
              className="w-[260px] p-2 translate-x-8 lg:translate-x-0"
              align="end"
            >
              <div className="space-y-1">
                <div
                  className={cn(
                    "rounded-xs transition-all",
                    isStatusOpen && "bg-neutral-50 pb-2",
                  )}
                >
                  <Button
                    variant="ghost"
                    onClick={() => setIsStatusOpen(!isStatusOpen)}
                    className={cn(
                      "w-full justify-between hover:bg-neutral-100",
                      hasActiveFilters &&
                        !isStatusOpen &&
                        "bg-neutral-50 font-medium",
                    )}
                  >
                    <span className="flex items-center gap-2 font-medium">
                      Estados
                    </span>
                    <FaChevronRight
                      className={cn(
                        "size-3.5 transition-transform duration-200",
                        isStatusOpen && "rotate-90",
                      )}
                    />
                  </Button>

                  {isStatusOpen && (
                    <div className="px-2 pt-1 space-y-1 animate-in slide-in-from-top-2 fade-in duration-200">
                      {FILTER_STATUS_OPTIONS.map((status) => {
                        const isSelected = activeStatuses.includes(
                          status.value as OrderStatus,
                        );
                        return (
                          <div
                            key={status.value}
                            onClick={() => toggleStatus(status.value)}
                            className={cn(
                              "flex items-center gap-2 py-1.5 rounded-xs cursor-pointer px-2 hover:bg-neutral-200/50 text-sm select-none transition-colors",
                            )}
                          >
                            <div
                              className={cn(
                                "w-4 h-4 border rounded-xs flex items-center justify-center transition-colors bg-white",
                                isSelected
                                  ? "bg-foreground border-foreground text-white"
                                  : "border-neutral-300",
                              )}
                            >
                              {isSelected && (
                                <FaCheck className="w-2.5 h-2.5" />
                              )}
                            </div>
                            <div
                              className={cn(
                                "w-2 h-2 rounded-full ml-1",
                                status.color,
                              )}
                            />
                            <span className="truncate">{status.label}</span>
                          </div>
                        );
                      })}
                    </div>
                  )}
                </div>

                <div className="pt-2 border-t mt-2">
                  <Button
                    variant="default"
                    className="w-full"
                    onClick={() => updateParams({ status_filter: null })}
                  >
                    Limpiar filtros
                  </Button>
                </div>
              </div>
            </PopoverContent>
          </Popover>

          <Select
            value={activeSort}
            onValueChange={(val) => updateParams({ sort: val })}
          >
            <SelectTrigger
              showIcon={false}
              className={cn(
                "h-9 w-[180px] font-medium hover:cursor-pointer focus-none",
                activeSort !== "date_desc" && "border-foreground",
              )}
            >
              <div className="flex items-center gap-2">
                <FaSort className="text-foreground" />
                <span className="text-foreground">
                  <SelectValue placeholder="Ordenar por" />
                </span>
              </div>
            </SelectTrigger>
            <SelectContent align="end" className="py-1">
              {ORDER_SORT_OPTIONS.map((option) => (
                <SelectItem key={option.value} value={option.value}>
                  {option.label}
                </SelectItem>
              ))}
            </SelectContent>
          </Select>
        </div>
      </div>
    </div>
  );
}
