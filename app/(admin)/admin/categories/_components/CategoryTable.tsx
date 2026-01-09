import Link from "next/link";

import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";

import type { AdminCategoryItem } from "@/lib/categories/types";

export function CategoryTable({
  categories,
}: {
  categories: AdminCategoryItem[];
}) {
  if (categories.length === 0) {
    return (
      <div className="flex flex-col items-center justify-center py-16 text-neutral-500 bg-white border border-dashed rounded-lg">
        <p className="font-medium">No hay categorías que mostrar.</p>
        <p className="text-xs mt-1">
          Intenta cambiar los filtros o crear una nueva.
        </p>
      </div>
    );
  }

  return (
    <div className="overflow-hidden">
      <Table>
        <TableHeader className="bg-neutral-50">
          <TableRow>
            <TableHead className="w-[80px] text-center">Orden</TableHead>
            <TableHead>Nombre</TableHead>
            <TableHead className="hidden sm:table-cell">Creado</TableHead>
            <TableHead className="text-center">Productos</TableHead>
            <TableHead className="text-right pr-4">Acciones</TableHead>
          </TableRow>
        </TableHeader>
        <TableBody>
          {categories.map((cat) => (
            <TableRow key={cat.id} className="hover:bg-neutral-50">
              {/* 1. ORDEN */}
              <TableCell className="text-center font-mono text-xs py-4">
                {cat.sort}
              </TableCell>

              <TableCell className="py-3">
                <div className="flex flex-col">
                  <span className="font-medium">{cat.name}</span>
                </div>
              </TableCell>

              {/* 3. FECHA */}
              <TableCell className="hidden sm:table-cell text-xs py-3">
                {new Date(cat.createdAt).toLocaleDateString()}
              </TableCell>

              {/* 4. PRODUCTOS (Badge) */}
              <TableCell className="text-center py-3">
                <span
                  className={`inline-flex px-2.5 py-0.5 rounded-full text-xs font-medium border ${
                    cat._count.products > 0
                      ? "bg-green-50 text-green-700 border-green-100"
                      : "bg-red-50 text-red-500 border-red-200"
                  }`}
                >
                  {cat._count.products}
                </span>
              </TableCell>

              {/* 5. ACCIONES */}
              <TableCell className="text-right pr-3 py-3">
                <button className="fx-underline-anim mx-3 font-medium">
                  <Link href={`/admin/categories/${cat.id}`}>Editar</Link>
                </button>
              </TableCell>
            </TableRow>
          ))}
        </TableBody>
      </Table>
    </div>
  );
}
