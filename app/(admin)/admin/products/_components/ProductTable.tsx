import Image from "next/image";
import Link from "next/link";

import { Button } from "@/components/ui/button";

import { formatCurrency, parseCurrency } from "@/lib/currency";
import { type AdminProductItem } from "@/lib/products/types";
import { cn } from "@/lib/utils";

interface ProductTableProps {
  products: AdminProductItem[];
  grandTotalStock: number;
}

export function ProductTable({ products, grandTotalStock }: ProductTableProps) {
  if (products.length === 0) {
    return (
      <div className="text-center py-12 text-neutral-500">
        No se encontraron productos con estos filtros.
      </div>
    );
  }

  return (
    <div className="relative w-full overflow-auto">
      <table className="w-full text-sm text-left">
        <thead className="text-xs text-foreground uppercase bg-neutral-50 border-b">
          <tr>
            <th className="px-6 py-3 font-semibold w-[80px]">Imagen</th>
            <th className="px-6 py-3 font-semibold">Nombre</th>
            <th className="px-6 py-3 font-semibold">Categoría</th>
            <th className="px-6 py-3 font-semibold">Precio</th>
            <th className="px-6 py-3 font-semibold">
              Stock Total ({grandTotalStock})
            </th>
            <th className="px-6 py-3 font-semibold text-right">Acciones</th>
          </tr>
        </thead>
        <tbody className="divide-y divide-neutral-100">
          {products.map((product) => {
            const isArchived = product.isArchived;
            const img = product.images[0]?.url ?? "/og/default-product.jpg";
            const currency = parseCurrency(product.currency);
            const totalStock = product._totalStock;
            const isOutOfStock = totalStock === 0;

            return (
              <tr
                key={product.id}
                className="group hover:bg-neutral-50/50 transition-colors"
              >
                <td className="px-6 py-3">
                  <div className="relative h-10 w-10 rounded overflow-hidden bg-neutral-100 border">
                    <Image
                      src={img}
                      alt={product.name}
                      fill
                      className="object-cover"
                      sizes="40px"
                    />
                  </div>
                </td>
                <td className="px-6 py-3 font-medium text-neutral-900">
                  <div className="flex items-center gap-2">
                    {product.name}
                    {isOutOfStock && !isArchived && (
                      <span className="inline-flex items-center rounded-full bg-red-100 px-2 py-0.5 text-[10px] font-medium text-red-800">
                        Agotado
                      </span>
                    )}
                    {isArchived && (
                      <span className="inline-flex items-center rounded-full bg-neutral-200 px-2 py-0.5 text-[10px] font-medium text-neutral-700">
                        Archivado
                      </span>
                    )}
                  </div>
                </td>
                <td className="px-6 py-3 text-neutral-500">
                  {product.category.name}
                </td>
                <td className="px-6 py-3 font-medium">
                  {formatCurrency(product.priceCents, currency)}
                </td>
                <td className="px-6 py-3">
                  <span
                    className={cn(
                      "font-medium",
                      isOutOfStock ? "text-red-600" : "text-green-600",
                    )}
                  >
                    {totalStock} u.
                  </span>
                  <span className="text-xs text-muted-foreground ml-1">
                    ({product.variants.length} var.)
                  </span>
                </td>
                <td className="px-6 py-3 text-right">
                  <Button
                    asChild
                    variant="ghost"
                    size="sm"
                    className="h-8 px-2 lg:px-3"
                  >
                    <Link href={`/admin/products/${product.id}`}>Editar</Link>
                  </Button>
                </td>
              </tr>
            );
          })}
        </tbody>
      </table>
    </div>
  );
}
