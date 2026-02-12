import Link from "next/link";
import { FaBagShopping } from "react-icons/fa6";

import { Button } from "@/components/ui/button";

type Props = {
  title?: string;
  description?: string;
  actionLabel?: string;
  actionHref?: string;
};

export function EmptyState({
  title = "No se encontraron productos",
  description = "Intenta ajustar tus filtros o busca en otra categoría.",
  actionLabel = "Ver todo el catálogo",
  actionHref = "/catalogo",
}: Props) {
  return (
    <div className="flex flex-col items-center justify-center text-center py-16 px-4 bg-neutral-50 rounded-xs border border-neutral-200 border-dashed">
      <div className="bg-white p-4 rounded-full shadow-sm mb-4 border">
        <FaBagShopping className="size-8 text-foreground" />
      </div>
      <h3 className="text-lg font-semibold text-neutral-900">{title}</h3>
      <p className="text-neutral-500 max-w-sm mt-2 mb-6 text-sm">
        {description}
      </p>
      <Button asChild variant="default" size="lg" className="px-3">
        <Link href={actionHref}>{actionLabel}</Link>
      </Button>
    </div>
  );
}
