import Link from "next/link";

import { Button, PendingLink } from "@/components/ui";

import { makePageHref } from "@/lib/catalog/pagination";

export function PaginationNav({
  page,
  totalPages,
  base,
}: {
  page: number;
  totalPages: number;
  base: string;
}) {
  const prevPage = Math.max(1, page - 1);
  const nextPage = Math.min(totalPages, page + 1);
  const prevHref = makePageHref(base, prevPage);
  const nextHref = makePageHref(base, nextPage);

  return (
    <nav
      aria-label="Paginación"
      className="flex items-center justify-end gap-2 mb-6"
    >
      <p className="text-sm text-neutral-500">
        Página {page} de {totalPages}
      </p>
      <Button asChild variant="outline" disabled={page <= 1}>
        <PendingLink href={prevHref} rel="prev" className="px-4 py-2">
          Anterior
        </PendingLink>
      </Button>
      <Button asChild disabled={page >= totalPages}>
        <PendingLink href={nextHref} rel="next" className="px-4 py-2">
          Siguiente
        </PendingLink>
      </Button>
    </nav>
  );
}
