import Link from "next/link";
import { FaPlus } from "react-icons/fa6";

import { PaginationNav } from "@/components/catalog/PaginationNav";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui";

import { getAdminProducts, getMaxPrice } from "@/lib/products/queries";
import { cn } from "@/lib/utils";

import { ProductListToolbar } from "./_components/list/ProductListToolbar";
import { ProductTable } from "./_components/list/ProductTable";

export const dynamic = "force-dynamic";

type Props = {
  searchParams: Promise<{
    sort?: string;
    categories?: string;
    status?: string;
    min?: string;
    max?: string;
    q?: string;
    page?: string;
  }>;
};

const tabs = [
  { label: "Activos", value: undefined },
  { label: "Archivados / Papelera", value: "archived" },
];

export default async function AdminProductsPage({ searchParams }: Props) {
  const sp = await searchParams;

  const page = Number(sp.page) || 1;
  const query = sp.q?.trim();
  const categories = sp.categories?.split(",").filter(Boolean);
  const status = sp.status;

  // Helpers de precio
  const parseCents = (val?: string) =>
    val && !isNaN(parseFloat(val))
      ? Math.round(parseFloat(val) * 100)
      : undefined;

  const minCents = parseCents(sp.min);
  const maxCents = parseCents(sp.max);

  // Queries
  const [productsData, globalMaxPrice] = await Promise.all([
    getAdminProducts({
      page,
      query,
      sort: sp.sort,
      categories,
      status,
      minPrice: minCents,
      maxPrice: maxCents,
    }),
    getMaxPrice(),
  ]);

  const { products, totalCount, totalPages, allCategories, grandTotalStock } =
    productsData;

  const isArchivedView = status === "archived";

  return (
    <div className="space-y-6">
      <div className="flex sm:flex-row sm:items-center justify-between gap-4">
        <h1 className="text-2xl font-bold tracking-tight">Productos</h1>

        <Link
          href="/admin/products/new"
          className="flex items-center font-medium gap-2 bg-foreground text-background py-2 px-3 rounded-xs text-sm"
        >
          <FaPlus className="h-4 w-4" /> Añadir producto
        </Link>
      </div>

      {/* TABS DE FILTRO RÁPIDO */}
      <div className="flex gap-6 text-sm">
        {tabs.map((tab) => {
          const isActive = sp.status === tab.value;
          return (
            <Link
              key={tab.label}
              href={
                tab.value
                  ? `/admin/products?status=${tab.value}`
                  : "/admin/products"
              }
              className={cn(
                "pb-0.5 border-b-2 font-semibold transition-colors",
                isActive
                  ? "border-foreground"
                  : "border-transparent text-neutral-500 hover:text-neutral-700 hover:border-neutral-300 actve:text-neutral-700 actve:border-neutral-300",
              )}
            >
              {tab.label}
            </Link>
          );
        })}
      </div>

      <Card>
        <CardHeader className="p-4 border-b flex flex-col sm:flex-row sm:items-center items-start justify-between gap-3 sm:gap-4">
          <CardTitle className="text-lg text-left font-semibold">
            {isArchivedView ? "Papelera" : "Total"}{" "}
            <span className="text-base">({totalCount})</span>
          </CardTitle>

          <div className="w-full sm:w-auto">
            <ProductListToolbar
              categories={allCategories}
              globalMaxPrice={globalMaxPrice}
            />
          </div>
        </CardHeader>
        <CardContent className="p-0">
          <ProductTable products={products} grandTotalStock={grandTotalStock} />

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
