import { type Prisma } from "@prisma/client";
import Link from "next/link";
import { FaPlus } from "react-icons/fa6";

import { PaginationNav } from "@/components/catalog/PaginationNav";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";

import { prisma } from "@/lib/db";

import { CategoryListToolbar } from "./_components/CategoryListToolbar";
import { CategoryTable } from "./_components/CategoryTable";

export const dynamic = "force-dynamic";

interface Props {
  searchParams: Promise<{
    filter?: string;
    sortBy?: string;
    sortOrder?: "asc" | "desc";
    q?: string;
    page?: string;
  }>;
}

export default async function AdminCategoriesPage({ searchParams }: Props) {
  const {
    filter = "all",
    sortBy = "sort",
    sortOrder = "asc",
    q,
    page,
  } = await searchParams;

  const currentPage = Number(page) || 1;
  const itemsPerPage = 20;
  const skip = (currentPage - 1) * itemsPerPage;

  const where: Prisma.CategoryWhereInput = {};

  if (q) {
    where.name = { contains: q, mode: "insensitive" };
  }

  if (filter === "with_products") {
    where.products = { some: {} };
  } else if (filter === "empty") {
    where.products = { none: {} };
  }

  let orderBy: Prisma.CategoryOrderByWithRelationInput = {};
  if (sortBy === "products") {
    orderBy = { products: { _count: sortOrder } };
  } else {
    orderBy = { [sortBy]: sortOrder };
  }

  const [categories, totalCount] = await Promise.all([
    prisma.category.findMany({
      where,
      orderBy,
      include: {
        _count: { select: { products: true } },
      },
      take: itemsPerPage,
      skip: skip,
    }),
    prisma.category.count({ where }),
  ]);

  const totalPages = Math.ceil(totalCount / itemsPerPage);

  return (
    <div className="space-y-6">
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <h1 className="text-2xl font-bold tracking-tight">Categorías</h1>
        <Button asChild>
          <Link href="/admin/categories/new">
            <FaPlus className="mr-2 h-4 w-4" /> Añadir Categoría
          </Link>
        </Button>
      </div>

      <Card>
        <CardHeader className="px-6 py-4 border-b bg-neutral-50/40 flex flex-col md:flex-row md:items-center justify-between gap-4">
          <CardTitle className="text-base font-semibold">
            Listado{" "}
            <span className="text-neutral-400 font-normal ml-1">
              ({categories.length})
            </span>
          </CardTitle>

          <div className="w-full md:w-auto">
            <CategoryListToolbar />
          </div>
        </CardHeader>
        <CardContent className="p-0">
          <CategoryTable categories={categories} />

          <div className="py-4 border-t flex justify-end px-4">
            <PaginationNav totalPages={totalPages} page={currentPage} />
          </div>
        </CardContent>
      </Card>
    </div>
  );
}
