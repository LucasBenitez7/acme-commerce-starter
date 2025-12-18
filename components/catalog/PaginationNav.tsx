"use client";

import Link from "next/link";
import { usePathname, useSearchParams } from "next/navigation";
import { FaChevronLeft, FaChevronRight } from "react-icons/fa6";

import { Button } from "@/components/ui/button";

import { cn } from "@/lib/utils";

interface Props {
  totalPages: number;
  page: number; // Página actual
}

export function PaginationNav({ totalPages, page }: Props) {
  const pathname = usePathname();
  const searchParams = useSearchParams();

  if (totalPages <= 1) return null;

  const createPageUrl = (pageNumber: number) => {
    const params = new URLSearchParams(searchParams.toString());
    params.set("page", pageNumber.toString());
    return `${pathname}?${params.toString()}`;
  };

  const hasPrev = page > 1;
  const hasNext = page < totalPages;

  return (
    <nav
      aria-label="Paginación"
      className="flex items-center justify-center gap-2 mt-4"
    >
      {/* Botón ANTERIOR */}
      <Button
        variant="outline"
        size="icon"
        asChild
        disabled={!hasPrev}
        className={cn("h-8 w-8", !hasPrev && "opacity-50 pointer-events-none")}
      >
        <Link href={createPageUrl(page - 1)} rel="prev" aria-label="Anterior">
          <FaChevronLeft className="h-4 w-4" />
        </Link>
      </Button>

      {/* Indicador de Texto */}
      <span className="text-sm font-medium text-neutral-600 px-2">
        Página {page} de {totalPages}
      </span>

      {/* Botón SIGUIENTE */}
      <Button
        variant="outline"
        size="icon"
        asChild
        disabled={!hasNext}
        className={cn("h-8 w-8", !hasNext && "opacity-50 pointer-events-none")}
      >
        <Link href={createPageUrl(page + 1)} rel="next" aria-label="Siguiente">
          <FaChevronRight className="h-4 w-4" />
        </Link>
      </Button>
    </nav>
  );
}
