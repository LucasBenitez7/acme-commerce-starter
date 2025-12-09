import Image from "next/image";
import Link from "next/link";
import { FaPlus, FaPencil } from "react-icons/fa6";

import {
  Button,
  Card,
  CardContent,
  CardHeader,
  CardTitle,
} from "@/components/ui";

import { formatMinor, parseCurrency } from "@/lib/currency";
import { prisma } from "@/lib/db";
import { cn } from "@/lib/utils";

import { ProductListToolbar } from "@/app/(admin)/components/products/ProductListToolbar";

import type { Prisma } from "@prisma/client";

export const dynamic = "force-dynamic";

type Props = {
  searchParams: Promise<{
    sort?: string;
    categories?: string;
    status?: string;
    min?: string;
    max?: string;
  }>;
};

export default async function AdminProductsPage({ searchParams }: Props) {
  const sp = await searchParams;

  const isArchivedView = sp.status === "archived";

  const categoryIds = sp.categories?.split(",").filter(Boolean) || [];
  const minCents = sp.min ? Math.round(parseFloat(sp.min) * 100) : undefined;
  const maxCents = sp.max ? Math.round(parseFloat(sp.max) * 100) : undefined;

  const where: Prisma.ProductWhereInput = {
    isArchived: isArchivedView,
    ...(categoryIds.length > 0 && {
      categoryId: { in: categoryIds },
    }),
    priceCents: {
      gte: minCents,
      lte: maxCents,
    },
  };

  let orderBy: Prisma.ProductOrderByWithRelationInput = { createdAt: "desc" };

  const isStockSort = sp.sort === "stock_asc" || sp.sort === "stock_desc";

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

  const [productsRaw, categories] = await Promise.all([
    prisma.product.findMany({
      where,
      orderBy,
      include: {
        category: true,
        variants: true,
        images: { orderBy: { sort: "asc" }, take: 1 },
      },
    }),
    prisma.category.findMany({ orderBy: { name: "asc" } }),
  ]);

  let products = productsRaw.map((p) => ({
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

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <h1 className="text-2xl font-bold tracking-tight">Productos</h1>
        <Button asChild>
          <Link href="/admin/products/new">
            <FaPlus className="mr-2 h-4 w-4" />
            Nuevo Producto
          </Link>
        </Button>
      </div>

      {/* PESTAÑAS DE NAVEGACIÓN (Estilo Pedidos) */}
      <div className="flex gap-2 border-b pb-1 overflow-x-auto">
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
                "px-4 py-2 text-sm font-medium border-b-2 transition-colors whitespace-nowrap hover:text-black",
                isActive
                  ? "border-black text-black"
                  : "border-transparent text-neutral-500 hover:border-neutral-300",
              )}
            >
              {tab.label}
            </Link>
          );
        })}
      </div>

      <Card>
        <CardHeader className="px-6 py-4 border-b bg-neutral-50/50 flex flex-row items-center justify-between">
          <CardTitle className="text-base">
            {isArchivedView ? "Papelera" : "Catálogo"} ({products.length})
          </CardTitle>

          <div className="w-full sm:w-auto">
            <ProductListToolbar categories={categories} />
          </div>
        </CardHeader>
        <CardContent className="p-0">
          <div className="relative w-full overflow-auto">
            <table className="w-full text-sm text-left">
              <thead className="text-xs text-foreground uppercase bg-neutral-50 border-b">
                <tr>
                  <th className="px-6 py-3 font-semibold w-[80px]">Imagen</th>
                  <th className="px-6 py-3 font-semibold">Nombre</th>
                  <th className="px-6 py-3 font-semibold">Categoría</th>
                  <th className="px-6 py-3 font-semibold">Precio</th>
                  <th className="px-6 py-3 font-semibold">
                    Total Stock ({grandTotalStock})
                  </th>
                  <th className="px-6 py-3 font-semibold text-right">
                    Acciones
                  </th>
                </tr>
              </thead>
              <tbody className="divide-y divide-neutral-100">
                {products.length === 0 ? (
                  <tr>
                    <td
                      colSpan={6}
                      className="px-6 py-12 text-center text-neutral-500"
                    >
                      No se encontraron productos con estos filtros.
                    </td>
                  </tr>
                ) : (
                  products.map((product) => {
                    const isArchived = product.isArchived;
                    const img =
                      product.images[0]?.url ?? "/og/default-products.jpg";
                    const currency = parseCurrency(product.currency);
                    const totalStock = product._totalStock;
                    const isOutOfStock = totalStock === 0;

                    return (
                      <tr key={product.id}>
                        <td className="px-6 py-3">
                          <div className="relative h-10 w-10 rounded overflow-hidden bg-neutral-100 border">
                            <Image
                              src={img}
                              alt={product.name}
                              fill
                              className="object-cover"
                            />
                          </div>
                        </td>
                        <td className="px-6 py-3 font-medium text-neutral-900">
                          {product.name}
                          {isOutOfStock && !isArchived && (
                            <span className="ml-2 inline-flex items-center rounded-full bg-red-100 px-2 py-0.5 text-[10px] font-medium text-red-800">
                              Agotado
                            </span>
                          )}
                          {isArchived && (
                            <span className="ml-2 inline-flex items-center rounded-full bg-gray-200 px-2 py-0.5 text-[10px] font-medium text-gray-700 border border-gray-300">
                              Archivado
                            </span>
                          )}
                        </td>
                        <td className="px-6 py-3 text-neutral-500">
                          {product.category.name}
                        </td>
                        <td className="px-6 py-3 font-medium">
                          {formatMinor(product.priceCents, currency)}
                        </td>
                        <td className="px-6 py-3">
                          <span
                            className={`font-medium ${isOutOfStock ? "text-red-600" : "text-green-600"}`}
                          >
                            {totalStock} u.
                          </span>
                          <span className="text-xs text-muted-foreground ml-1">
                            ({product.variants.length} var.)
                          </span>
                        </td>
                        <td
                          className={cn(
                            isArchived &&
                              "text-foreground opacity-100 bg-transparent",
                            "px-6 py-3 text-right",
                          )}
                        >
                          <Button
                            asChild
                            variant="outline"
                            className={cn(
                              isArchived &&
                                "text-foreground opacity-100 bg-transparent",
                            )}
                          >
                            <Link
                              href={`/admin/products/${product.id}`}
                              className="px-3"
                            >
                              Editar
                            </Link>
                          </Button>
                        </td>
                      </tr>
                    );
                  })
                )}
              </tbody>
            </table>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}
