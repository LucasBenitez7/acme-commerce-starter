import Link from "next/link";

import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";

import { prisma } from "@/lib/db";

import { CategoryToolbar } from "./_components/OrderCatToolbar";

export const dynamic = "force-dynamic";

interface Props {
  searchParams: Promise<{
    filter?: string;
    sortBy?: string;
    sortOrder?: "asc" | "desc";
  }>;
}

export default async function AdminCategoriesPage({ searchParams }: Props) {
  const {
    filter = "all",
    sortBy = "sort",
    sortOrder = "asc",
  } = await searchParams;

  let whereClause: any = {};

  if (filter === "with_products") {
    whereClause.products = { some: {} };
  } else if (filter === "empty") {
    whereClause.products = { none: {} };
  }

  let orderByClause: any = {};

  if (sortBy === "products") {
    orderByClause = { products: { _count: sortOrder } };
  } else {
    orderByClause = { [sortBy]: sortOrder };
  }

  const categories = await prisma.category.findMany({
    where: whereClause,
    orderBy: orderByClause,
    include: {
      _count: { select: { products: true } },
    },
  });

  return (
    <div className="space-y-6">
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div>
          <h1 className="text-2xl font-bold tracking-tight">Categorías</h1>
        </div>
        <Button asChild className="flex tems-center border">
          <Link href="/admin/categories/new">Añadir Categoría</Link>
        </Button>
      </div>

      <Card>
        <CardHeader className="px-6 py-4 border-b bg-neutral-50/50">
          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
            <CardTitle className="text-base flex items-center gap-2">
              Listado
              <span className="inline-flex items-center justify-center bg-neutral-200 text-neutral-800 text-xs font-bold px-2 py-0.5 rounded-full">
                {categories.length}
              </span>
            </CardTitle>

            <CategoryToolbar />
          </div>
        </CardHeader>
        <CardContent className="p-0">
          <div className="relative w-full overflow-auto">
            <table className="w-full text-sm text-left">
              <thead className="text-xs uppercase bg-neutral-50 border-b">
                <tr>
                  <th className="px-6 py-3 w-20">Orden</th>
                  <th className="px-6 py-3">Nombre</th>
                  <th className="px-6 py-3 w-32 hidden sm:table-cell">
                    Creado
                  </th>
                  <th className="px-6 py-3 text-center w-32">Productos</th>
                  <th className="px-6 py-3 text-right">Acciones</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-neutral-100">
                {categories.length === 0 ? (
                  <tr>
                    <td
                      colSpan={6}
                      className="px-6 py-16 text-center text-neutral-500"
                    >
                      <div className="flex flex-col items-center gap-2">
                        <p className="font-medium">
                          No se encontraron categorías
                        </p>
                        <p className="text-xs">
                          Prueba cambiando los filtros seleccionados
                        </p>
                      </div>
                    </td>
                  </tr>
                ) : (
                  categories.map((cat: any) => (
                    <tr
                      key={cat.id}
                      className="bg-white hover:bg-neutral-50 transition-colors"
                    >
                      <td className="px-6 py-3 font-mono text-xs text-center">
                        {cat.sort ?? "-"}
                      </td>
                      <td className="px-6 py-3 font-medium">{cat.name}</td>
                      <td className="px-6 py-3 text-xs font-medium hidden sm:table-cell">
                        {cat.createdAt
                          ? new Date(cat.createdAt).toLocaleDateString()
                          : "-"}
                      </td>
                      <td className="px-6 py-3 text-center">
                        <span
                          className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium border ${
                            cat._count.products > 0
                              ? "bg-blue-50 text-blue-700 border-blue-100"
                              : "bg-neutral-100 text-neutral-500 border-neutral-200"
                          }`}
                        >
                          {cat._count.products}
                        </span>
                      </td>
                      <td className="px-6 py-3 text-right">
                        <div className="flex justify-end gap-4 items-center">
                          <Link
                            href={`/admin/categories/${cat.id}`}
                            className="text-blue-600 hover:border-blue-600 border-b-[2px] border-transparent p-0"
                          >
                            Editar
                          </Link>
                        </div>
                      </td>
                    </tr>
                  ))
                )}
              </tbody>
            </table>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}
