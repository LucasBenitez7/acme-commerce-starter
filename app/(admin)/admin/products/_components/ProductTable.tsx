"use client";

import Image from "next/image";
import Link from "next/link";
import { FaEdit } from "react-icons/fa";

import { Button } from "@/components/ui/button";
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
  grandTotalStock: number; // Mantenemos esto si lo usas en el header
}

export function ProductTable({ products, grandTotalStock }: ProductTableProps) {
  if (products.length === 0) {
    return (
      <div className="flex flex-col items-center justify-center py-16 text-neutral-500 bg-white border border-dashed rounded-lg">
        <p>No se encontraron productos con estos filtros.</p>
      </div>
    );
  }

  return (
    <div className="rounded-md border bg-white overflow-hidden">
      <Table>
        <TableHeader className="bg-neutral-50">
          <TableRow>
            <TableHead className="w-[80px]">Imagen</TableHead>
            <TableHead>Nombre / Estado</TableHead>
            <TableHead>Categoría</TableHead>
            <TableHead>Precio</TableHead>
            <TableHead className="text-right">Stock</TableHead>
            <TableHead className="text-right">Acciones</TableHead>
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
              <TableRow key={product.id} className="hover:bg-neutral-50/50">
                {/* 1. IMAGEN */}
                <TableCell className="py-3">
                  <div className="relative h-12 w-12 rounded-md border bg-neutral-100 overflow-hidden">
                    <Image
                      src={img}
                      alt={product.name}
                      fill
                      className="object-cover"
                      sizes="48px"
                    />
                  </div>
                </TableCell>

                {/* 2. NOMBRE + BADGES */}
                <TableCell>
                  <div className="flex flex-col gap-1">
                    <div className="flex items-center gap-2">
                      <span className="font-medium text-neutral-900 line-clamp-1">
                        {product.name}
                      </span>

                      {/* Badge de Archivado */}
                      {isArchived && (
                        <span className="inline-flex items-center rounded-md bg-amber-50 px-2 py-0.5 text-xs font-medium text-amber-700 ring-1 ring-inset ring-amber-600/20">
                          Archivado
                        </span>
                      )}

                      {/* Badge de Agotado */}
                      {isOutOfStock && !isArchived && (
                        <span className="inline-flex items-center rounded-md bg-red-50 px-2 py-0.5 text-xs font-medium text-red-700 ring-1 ring-inset ring-red-600/10">
                          Agotado
                        </span>
                      )}
                    </div>
                    {/* Subtítulo de variantes */}
                    <span className="text-xs text-muted-foreground">
                      {product.variants.length} variantes configuradas
                    </span>
                  </div>
                </TableCell>

                {/* 3. CATEGORÍA */}
                <TableCell className="text-muted-foreground">
                  {product.category.name}
                </TableCell>

                {/* 4. PRECIO */}
                <TableCell>
                  {formatCurrency(product.priceCents, currency)}
                </TableCell>

                {/* 5. STOCK */}
                <TableCell className="text-right">
                  <div className="flex flex-col items-end">
                    <span
                      className={cn(
                        "font-medium",
                        isOutOfStock ? "text-red-600" : "text-neutral-700",
                      )}
                    >
                      {totalStock} u.
                    </span>
                  </div>
                </TableCell>

                {/* 6. ACCIONES (Solo Editar) */}
                <TableCell className="text-right">
                  <Button
                    variant="ghost"
                    size="icon"
                    asChild
                    className="h-8 w-8 text-neutral-500 hover:text-black"
                  >
                    <Link href={`/admin/products/${product.id}`}>
                      <FaEdit className="h-4 w-4" />
                      <span className="sr-only">Editar</span>
                    </Link>
                  </Button>
                </TableCell>
              </TableRow>
            );
          })}
        </TableBody>
      </Table>
    </div>
  );
}
