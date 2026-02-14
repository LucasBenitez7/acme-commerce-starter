"use client";

import { useState, type ReactNode } from "react";
import { VscSettings } from "react-icons/vsc";

import { Button, Sheet, SheetContent } from "@/components/ui";

import { useActiveFilters } from "@/hooks/common/use-active-filters";

import { FilterSheet } from "./FilterSheet";

import type { FilterOptions } from "@/lib/products/types";

export function SectionHeader({
  title,
  rightSlot,
  filterOptions,
  className,
  subTitle,
}: {
  title: string;
  rightSlot?: ReactNode;
  filterOptions?: FilterOptions;
  className?: string;
  subTitle?: string;
}) {
  const [showFilters, setShowFilters] = useState(false);
  const { count: filtersCount } = useActiveFilters();

  return (
    <>
      <header
        className={`${className} py-3 flex sticky top-14 z-30 w-full items-center justify-between px-5 bg-background`}
      >
        <div className="flex items-center gap-1">
          <h1 className="text-xl font-medium capitalize">{title}</h1>
          {subTitle && (
            <p className="text-sm text-muted-foreground">({subTitle})</p>
          )}
        </div>
        {rightSlot !== false &&
          ((rightSlot ?? filterOptions) ? (
            <Button
              type="button"
              variant="ghost"
              onClick={() => setShowFilters(true)}
              className="flex items-center gap-2 text-foreground"
            >
              <VscSettings className="size-5 stroke-[0.5px]" />
              <span className="text-sm select-none">
                Filtrar y Ordenar
                {filtersCount > 0 && ` (${filtersCount})`}
              </span>
            </Button>
          ) : null)}
      </header>

      {/* Sheet lateral */}
      {filterOptions && (
        <Sheet open={showFilters} onOpenChange={setShowFilters}>
          <SheetContent
            side="right"
            className="z-[190] w-full sm:w-[min(100vw,400px)] p-0 flex flex-col"
            overlayClassName="z-[180] bg-black/60"
          >
            <FilterSheet
              options={filterOptions}
              onClose={() => setShowFilters(false)}
            />
          </SheetContent>
        </Sheet>
      )}
    </>
  );
}
