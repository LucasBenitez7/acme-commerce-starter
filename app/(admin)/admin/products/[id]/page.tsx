import Link from "next/link";
import { notFound } from "next/navigation";
import {
  FaArrowUpRightFromSquare,
  FaBoxOpen,
  FaCartShopping,
  FaLayerGroup,
} from "react-icons/fa6";

import { Button } from "@/components/ui/button";

import { prisma } from "@/lib/db";
import { getProductFormDependencies } from "@/lib/products/service";

import { StatCard } from "@/app/(admin)/_components/StatCard";

import { ArchiveButton } from "../_components/ArchiveButton";
import { ProductForm } from "../_components/ProductForm";

export default async function EditProductPage({
  params,
}: {
  params: Promise<{ id: string }>;
}) {
  const { id } = await params;

  const [product, formDeps] = await Promise.all([
    prisma.product.findUnique({
      where: { id },
      include: {
        category: true,
        images: { orderBy: { sort: "asc" } },
        variants: { orderBy: { size: "asc" } },
        _count: { select: { orderItems: true } },
      },
    }),
    getProductFormDependencies(),
  ]);

  if (!product) notFound();

  const totalStock = product.variants.reduce((acc, v) => acc + v.stock, 0);
  const totalVariants = product.variants.length;
  const totalSales = product._count.orderItems;

  return (
    <div className="space-y-8 max-w-5xl mx-auto pb-20">
      {/* --- HEADER --- */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <div className="flex items-center gap-2 text-sm text-muted-foreground mb-1">
            <span className="bg-neutral-100 px-2 py-0.5 rounded-md text-xs font-medium text-neutral-600 border">
              {product.category.name}
            </span>
            {product.isArchived && (
              <span className="bg-amber-100 px-2 py-0.5 rounded-md text-xs font-medium text-amber-700 border border-amber-200">
                Archivado
              </span>
            )}
            <ArchiveButton
              productId={product.id}
              productName={product.name}
              isArchived={product.isArchived}
            />
          </div>
          <h1 className="text-2xl font-bold tracking-tight text-neutral-900">
            {product.name}
          </h1>
        </div>

        <Button variant="outline" asChild className="gap-2 text-xs h-9">
          <Link href={`/product/${product.slug}`} target="_blank">
            Ver en Tienda{" "}
            <FaArrowUpRightFromSquare className="text-neutral-400" />
          </Link>
        </Button>
      </div>

      {/* --- STATS --- */}
      <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
        <StatCard
          label="Stock Total"
          value={`${totalStock} u.`}
          icon={FaBoxOpen}
          subtext={totalStock === 0 ? "⚠️ Agotado" : "En inventario"}
          trend={totalStock < 5 ? "low" : "normal"}
        />
        <StatCard
          label="Variantes"
          value={totalVariants}
          icon={FaLayerGroup}
          subtext="Colores y tallas"
        />
        <StatCard
          label="Ventas"
          value={totalSales}
          icon={FaCartShopping}
          subtext="Histórico total"
          trend={totalSales > 0 ? "good" : "normal"}
        />
      </div>

      {/* --- FORMULARIO --- */}
      <ProductForm product={product} {...formDeps} />
    </div>
  );
}
