import Link from "next/link";

import { PaginationNav } from "@/components/catalog/PaginationNav";
import {
  Button,
  Card,
  CardContent,
  CardHeader,
  CardTitle,
} from "@/components/ui";

import { prisma } from "@/lib/db";
import { cn } from "@/lib/utils";

import { ProductListToolbar } from "./_components/ProductListToolbar";
import { ProductTable } from "./_components/ProductTable";

import type { Prisma } from "@prisma/client";

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

export default async function AdminProductsPage({ searchParams }: Props) {
  const sp = await searchParams;
  const query = sp.q?.trim();

  const currentPage = Number(sp.page) || 1;
  const itemsPerPage = 15;
  const skip = (currentPage - 1) * itemsPerPage;

  const isArchivedView = sp.status === "archived";
  const categoryIds = sp.categories?.split(",").filter(Boolean) || [];

  // Parseo seguro de precios
  const minCents =
    sp.min && !isNaN(parseFloat(sp.min))
      ? Math.round(parseFloat(sp.min) * 100)
      : undefined;
  const maxCents =
    sp.max && !isNaN(parseFloat(sp.max))
      ? Math.round(parseFloat(sp.max) * 100)
      : undefined;

  const where: Prisma.ProductWhereInput = {
    isArchived: isArchivedView,
    ...(categoryIds.length > 0 && {
      categoryId: { in: categoryIds },
    }),
    priceCents: {
      gte: minCents,
      lte: maxCents,
    },
    ...(query && {
      OR: [
        { name: { contains: query, mode: "insensitive" } },
        { description: { contains: query, mode: "insensitive" } },
      ],
    }),
  };

  let orderBy: Prisma.ProductOrderByWithRelationInput = { createdAt: "desc" };
  const isStockSort = sp.sort === "stock_asc" || sp.sort === "stock_desc";

  // Lógica de ordenamiento DB
  if (!isStockSort) {
    switch (sp.sort) {
      case "date_asc":
        orderBy = { createdAt: "asc" };
        break;
      case "price_asc":
        orderBy = { priceCents: "asc" };
        break;
      case "price_desc":
        orderBy = { priceCents: "desc" };
        break;
      case "name_asc":
        orderBy = { name: "asc" };
        break;
      case "name_desc":
        orderBy = { name: "desc" };
        break;
      default:
        orderBy = { createdAt: "desc" };
    }
  }

  const [productsRaw, totalCount, categories] = await Promise.all([
    prisma.product.findMany({
      where,
      orderBy,
      include: {
        category: true,
        variants: true,
        images: { orderBy: { sort: "asc" }, take: 1 },
      },
      take: itemsPerPage,
      skip: skip,
    }),
    prisma.product.count({ where }),
    prisma.category.findMany({ orderBy: { name: "asc" } }),
  ]);

  const products = productsRaw.map((p) => ({
    ...p,
    _totalStock: p.variants.reduce((acc, v) => acc + v.stock, 0),
  }));

  if (sp.sort === "stock_asc") {
    products.sort((a, b) => a._totalStock - b._totalStock);
  } else if (sp.sort === "stock_desc") {
    products.sort((a, b) => b._totalStock - a._totalStock);
  }

  const grandTotalStock = products.reduce((acc, p) => acc + p._totalStock, 0);

  const tabs = [
    { label: "Activos", value: undefined },
    { label: "Archivados / Papelera", value: "archived" },
  ];

  const totalPages = Math.ceil(totalCount / itemsPerPage);

  return (
    <div className="space-y-6">
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <h1 className="text-2xl font-bold tracking-tight">Productos</h1>
        <Button asChild>
          <Link href="/admin/products/new">Añadir nuevo producto</Link>
        </Button>
      </div>

      {/* TABS DE FILTRO RÁPIDO */}
      <div className="flex gap-6 border-b text-sm">
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
                "pb-3 border-b-2 font-medium transition-colors",
                isActive
                  ? "border-black text-black"
                  : "border-transparent text-neutral-500 hover:text-neutral-700 hover:border-neutral-300",
              )}
            >
              {tab.label}
            </Link>
          );
        })}
      </div>

      <Card>
        <CardHeader className="px-6 py-4 border-b bg-neutral-50/40 flex flex-col md:flex-row md:items-center justify-between gap-4">
          <CardTitle className="text-base font-semibold">
            {isArchivedView ? "Papelera" : "Catálogo"}{" "}
            <span className="text-neutral-400 font-normal ml-1">
              ({products.length})
            </span>
          </CardTitle>

          <div className="w-full md:w-auto">
            <ProductListToolbar categories={categories} />
          </div>
        </CardHeader>
        <CardContent className="p-0">
          <ProductTable products={products} grandTotalStock={grandTotalStock} />

          <div className="py-4 border-t flex justify-end px-4">
            <PaginationNav totalPages={totalPages} page={currentPage} />
          </div>
        </CardContent>
      </Card>
    </div>
  );
}
