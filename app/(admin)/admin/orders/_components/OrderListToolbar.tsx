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
  ADMIN_FILTER_PAYMENT,
  ADMIN_FILTER_FULFILLMENT,
  ORDER_SORT_OPTIONS,
} from "@/lib/orders/constants";
import { cn } from "@/lib/utils";

import { useOrderFilters } from "@/hooks/order/use-order-filters";

import type { PaymentStatus, FulfillmentStatus } from "@prisma/client";

export function OrderListToolbar() {
  const {
    activeSort,
    activePaymentStatuses,
    activeFulfillmentStatuses,
    searchQuery,
    setSearchQuery,
    updateParams,
    togglePaymentStatus,
    toggleFulfillmentStatus,
  } = useOrderFilters();

  // Control de colapso de secciones en el filtro
  const [isPaymentOpen, setIsPaymentOpen] = useState(true);
  const [isFulfillmentOpen, setIsFulfillmentOpen] = useState(false);

  const hasActiveFilters =
    activePaymentStatuses.length > 0 || activeFulfillmentStatuses.length > 0;

  return (
    <div className="space-y-4 w-full rounded-xs">
      <div className="flex flex-col lg:flex-row gap-3 justify-between w-full items-start lg:items-center">
        {/* BUSCADOR */}
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

        {/* HERRAMIENTAS (FILTROS Y SORT) */}
        <div className="flex flex-wrap gap-3 justify-between w-full lg:w-auto items-center">
          {/* POPOVER DE FILTROS AVANZADOS */}
          <Popover>
            <PopoverTrigger asChild>
              <Button
                variant="outline"
                className={cn(
                  "relative border border-border h-9",
                  hasActiveFilters && "border-foreground bg-accent/50",
                )}
              >
                <FaFilter className="size-3.5 text-foreground mr-2" />
                Filtrar
                {hasActiveFilters && (
                  <span className="ml-1.5 flex h-4 w-4 items-center justify-center rounded-full bg-foreground text-[10px] text-background font-bold">
                    {activePaymentStatuses.length +
                      activeFulfillmentStatuses.length}
                  </span>
                )}
              </Button>
            </PopoverTrigger>

            <PopoverContent
              className="w-[280px] p-2 translate-x-8 lg:translate-x-0"
              align="end"
            >
              <div className="space-y-1 max-h-[400px] overflow-y-auto pr-1">
                {/* SECCIÓN 1: ESTADO DE PAGO */}
                <div
                  className={cn(
                    "rounded-sm transition-all",
                    isPaymentOpen && "bg-neutral-50 pb-2",
                  )}
                >
                  <Button
                    variant="ghost"
                    onClick={() => setIsPaymentOpen(!isPaymentOpen)}
                    className="w-full justify-between h-8 hover:bg-neutral-100 px-2"
                  >
                    <span className="text-xs font-bold uppercase text-neutral-500">
                      Pago
                    </span>
                    <FaChevronRight
                      className={cn(
                        "size-3 transition-transform duration-200 text-neutral-400",
                        isPaymentOpen && "rotate-90",
                      )}
                    />
                  </Button>

                  {isPaymentOpen && (
                    <div className="px-1 pt-1 space-y-0.5 animate-in slide-in-from-top-1 fade-in duration-200">
                      {ADMIN_FILTER_PAYMENT.map((status) => {
                        const isSelected = activePaymentStatuses.includes(
                          status.value as PaymentStatus,
                        );
                        return (
                          <div
                            key={status.value}
                            onClick={() => togglePaymentStatus(status.value)}
                            className="flex items-center gap-2 py-1.5 rounded-sm cursor-pointer px-2 hover:bg-neutral-200/50 text-sm select-none transition-colors"
                          >
                            <div
                              className={cn(
                                "w-4 h-4 border rounded-sm flex items-center justify-center transition-colors bg-white",
                                isSelected
                                  ? "bg-black border-black text-white"
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
                            <span className="truncate text-sm">
                              {status.label}
                            </span>
                          </div>
                        );
                      })}
                    </div>
                  )}
                </div>

                {/* SECCIÓN 2: ESTADO DE ENVÍO */}
                <div
                  className={cn(
                    "rounded-sm transition-all mt-1",
                    isFulfillmentOpen && "bg-neutral-50 pb-2",
                  )}
                >
                  <Button
                    variant="ghost"
                    onClick={() => setIsFulfillmentOpen(!isFulfillmentOpen)}
                    className="w-full justify-between h-8 hover:bg-neutral-100 px-2"
                  >
                    <span className="text-xs font-bold uppercase text-neutral-500">
                      Logística
                    </span>
                    <FaChevronRight
                      className={cn(
                        "size-3 transition-transform duration-200 text-neutral-400",
                        isFulfillmentOpen && "rotate-90",
                      )}
                    />
                  </Button>

                  {isFulfillmentOpen && (
                    <div className="px-1 pt-1 space-y-0.5 animate-in slide-in-from-top-1 fade-in duration-200">
                      {ADMIN_FILTER_FULFILLMENT.map((status) => {
                        const isSelected = activeFulfillmentStatuses.includes(
                          status.value as FulfillmentStatus,
                        );
                        return (
                          <div
                            key={status.value}
                            onClick={() =>
                              toggleFulfillmentStatus(status.value)
                            }
                            className="flex items-center gap-2 py-1.5 rounded-sm cursor-pointer px-2 hover:bg-neutral-200/50 text-sm select-none transition-colors"
                          >
                            <div
                              className={cn(
                                "w-4 h-4 border rounded-sm flex items-center justify-center transition-colors bg-white",
                                isSelected
                                  ? "bg-black border-black text-white"
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
                            <span className="truncate text-sm">
                              {status.label}
                            </span>
                          </div>
                        );
                      })}
                    </div>
                  )}
                </div>

                {/* BOTÓN LIMPIAR */}
                {hasActiveFilters && (
                  <div className="pt-2 border-t mt-2">
                    <Button
                      variant="secondary"
                      size="sm"
                      className="w-full h-8"
                      onClick={() =>
                        updateParams({
                          payment_filter: null,
                          fulfillment_filter: null,
                        })
                      }
                    >
                      Limpiar filtros
                    </Button>
                  </div>
                )}
              </div>
            </PopoverContent>
          </Popover>

          {/* ORDENAR POR */}
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
