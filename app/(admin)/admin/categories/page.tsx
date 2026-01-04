import Link from "next/link";
import { FaPlus } from "react-icons/fa6";

import { PaginationNav } from "@/components/catalog/PaginationNav";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";

import { getAdminCategories } from "@/lib/categories/queries";

import { CategoryListToolbar } from "./_components/CategoryListToolbar";
import { CategoryTable } from "./_components/CategoryTable";

export const dynamic = "force-dynamic";

interface Props {
  searchParams: Promise<{
    filter?: "all" | "with_products" | "empty";
    sortBy?: string;
    sortOrder?: "asc" | "desc";
    q?: string;
    page?: string;
  }>;
}

export default async function AdminCategoriesPage({ searchParams }: Props) {
  const sp = await searchParams;
  const page = Number(sp.page) || 1;

  // LLAMADA LIMPIA A LA QUERY
  const { categories, totalCount, totalPages } = await getAdminCategories({
    page,
    query: sp.q,
    filter: sp.filter,
    sortBy: sp.sortBy,
    sortOrder: sp.sortOrder,
  });

  return (
    <div className="space-y-6">
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <h1 className="text-2xl font-bold tracking-tight">Categorías</h1>
        <Link
          href="/admin/categories/new "
          className="flex items-center font-medium gap-2 bg-foreground text-background py-2 px-3 rounded-xs text-sm"
        >
          <FaPlus className="h-4 w-4" /> Añadir Categoría
        </Link>
      </div>

      <Card>
        <CardHeader className="p-4 border-b flex justify-between gap-4">
          <CardTitle className="text-lg font-semibold">
            Listado <span className="text-base">({totalCount})</span>
          </CardTitle>

          <div className="w-full md:w-auto">
            <CategoryListToolbar />
          </div>
        </CardHeader>
        <CardContent className="p-0">
          <CategoryTable categories={categories} />

          {totalPages > 1 && (
            <div className="py-4 flex justify-end px-4 border-t">
              <PaginationNav totalPages={totalPages} page={page} />
            </div>
          )}
        </CardContent>
      </Card>
    </div>
  );
}
