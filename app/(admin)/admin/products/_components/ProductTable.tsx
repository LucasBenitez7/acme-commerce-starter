"use client";

import Link from "next/link";

import { Image } from "@/components/ui/image";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";

import { formatCurrency, parseCurrency } from "@/lib/currency";
import { type AdminProductItem } from "@/lib/products/types";
import { cn } from "@/lib/utils";

interface ProductTableProps {
  products: AdminProductItem[];
  grandTotalStock: number;
}

export function ProductTable({ products }: ProductTableProps) {
  if (products.length === 0) {
    return (
      <div className="flex flex-col items-center justify-center py-16 text-neutral-500 bg-white border border-dashed rounded-lg">
        <p className="font-medium">No se encontraron productos.</p>
        <p className="text-xs mt-1">
          Intenta cambiar los filtros o crear uno nuevo.
        </p>
      </div>
    );
  }

  return (
    <div className="overflow-hidden">
      <Table>
        <TableHeader className="bg-neutral-50">
          <TableRow>
            <TableHead className="w-[80px]">Imagen</TableHead>
            <TableHead>Nombre</TableHead>
            <TableHead>Categoría</TableHead>
            <TableHead>Precio</TableHead>
            <TableHead className="text-right">Stock</TableHead>
            <TableHead className="text-right pr-4">Acciones</TableHead>
          </TableRow>
        </TableHeader>
        <TableBody>
          {products.map((product) => {
            const isArchived = product.isArchived;
            const img = product.images[0]?.url ?? "/og/default-product.jpg";
            const currency = parseCurrency(product.currency);
            const totalStock = product._totalStock;
            const isOutOfStock = totalStock === 0;

            return (
              <TableRow key={product.id} className="hover:bg-neutral-50">
                {/* 1. IMAGEN */}
                <TableCell className="py-3">
                  <div className="relative h-10 w-10 rounded-xs bg-neutral-100 overflow-hidden">
                    <Image
                      src={img}
                      alt={product.name}
                      fill
                      className="object-cover"
                      sizes="40px"
                    />
                  </div>
                </TableCell>

                <TableCell>
                  <div className="flex flex-col gap-1">
                    <div className="flex items-center gap-2">
                      <span className="font-medium">{product.name}</span>

                      {isArchived && (
                        <span className="inline-flex items-center rounded-full bg-amber-50 px-1 text-[10px] font-medium text-amber-700 border border-amber-200">
                          Archivado
                        </span>
                      )}

                      {isOutOfStock && !isArchived && (
                        <span className="inline-flex items-center rounded-full bg-red-50 px-1 text-[10px] font-medium text-red-700 border border-red-200">
                          Agotado
                        </span>
                      )}
                    </div>
                  </div>
                </TableCell>

                <TableCell className="text-sm font-medium">
                  {product.category.name}
                </TableCell>

                <TableCell className="font-medium">
                  {formatCurrency(product.priceCents, currency)}
                </TableCell>

                <TableCell className="text-right">
                  <span
                    className={cn(
                      "inline-flex px-2.5 py-0.5 rounded-full text-xs font-medium border",
                      isOutOfStock
                        ? "bg-red-50 text-red-500 border-red-200"
                        : "bg-green-50 text-green-700 border-green-100",
                    )}
                  >
                    {totalStock}
                  </span>
                </TableCell>

                <TableCell className="text-right pr-3">
                  <Link
                    href={`/admin/products/${product.id}`}
                    className="fx-underline-anim mx-3 font-medium text-sm"
                  >
                    Editar
                  </Link>
                </TableCell>
              </TableRow>
            );
          })}
        </TableBody>
      </Table>
    </div>
  );
}
