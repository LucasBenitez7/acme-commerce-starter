import Link from "next/link";
import { notFound } from "next/navigation";
import {
  FaArrowUpRightFromSquare,
  FaBoxOpen,
  FaCartShopping,
  FaLayerGroup,
} from "react-icons/fa6";

import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";

import { prisma } from "@/lib/db";

import { ProductForm } from "../_components/ProductForm";

export default async function EditProductPage({
  params,
}: {
  params: Promise<{ id: string }>;
}) {
  const { id } = await params;

  const product = await prisma.product.findUnique({
    where: { id },
    include: {
      category: true,
      images: { orderBy: { sort: "asc" } },
      variants: {
        orderBy: { size: "asc" },
      },
      _count: {
        select: { orderItems: true },
      },
    },
  });

  if (!product) notFound();

  const categories = await prisma.category.findMany({
    select: { id: true, name: true },
    orderBy: { name: "asc" },
  });

  const variantsData = await prisma.productVariant.findMany({
    select: { size: true, color: true },
    distinct: ["size", "color"],
  });

  const existingSizes = Array.from(new Set(variantsData.map((v) => v.size)));
  const existingColors = Array.from(new Set(variantsData.map((v) => v.color)));

  const totalStock = product.variants.reduce((acc, v) => acc + v.stock, 0);
  const totalVariants = product.variants.length;
  const totalSales = product._count.orderItems;

  return (
    <div className="space-y-8 max-w-5xl mx-auto">
      {/* --- HEADER SUPERIOR --- */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <div className="flex items-center gap-2 text-sm text-muted-foreground mb-1">
            <span className="bg-neutral-100 px-2 py-0.5 rounded text-xs font-medium text-neutral-600">
              {product.category.name}
            </span>
            {product.isArchived && (
              <span className="bg-amber-100 px-2 py-0.5 rounded text-xs font-medium text-amber-700 border border-amber-200">
                Archivado
              </span>
            )}
          </div>
          <h1 className="text-2xl font-bold tracking-tight text-neutral-900">
            {product.name}
          </h1>
        </div>

        <div className="flex gap-2">
          <Button variant="outline" asChild className="gap-2">
            <Link href={`/product/${product.slug}`} target="_blank">
              Ver en Tienda{" "}
              <FaArrowUpRightFromSquare className="text-neutral-400" />
            </Link>
          </Button>
        </div>
      </div>

      {/* --- MINI DASHBOARD (STATS) --- */}
      <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
        <StatCard
          label="Stock Total"
          value={`${totalStock} u.`}
          icon={FaBoxOpen}
          subtext={totalStock === 0 ? "⚠️ Agotado" : "Disponible"}
          trend={totalStock < 10 ? "low" : "normal"}
        />
        <StatCard
          label="Variantes"
          value={totalVariants}
          icon={FaLayerGroup}
          subtext="Combinaciones"
        />
        <StatCard
          label="Ventas Históricas"
          value={totalSales}
          icon={FaCartShopping}
          subtext="Pedidos completados"
        />
      </div>

      {/* --- FORMULARIO PRINCIPAL --- */}
      <ProductForm
        categories={categories}
        product={product}
        existingSizes={existingSizes}
        existingColors={existingColors}
      />
    </div>
  );
}

// Componente pequeño para las tarjetas de estadísticas
function StatCard({
  label,
  value,
  icon: Icon,
  subtext,
  trend = "normal",
}: {
  label: string;
  value: string | number;
  icon: any;
  subtext?: string;
  trend?: "normal" | "low";
}) {
  return (
    <Card>
      <CardContent className="p-6 flex items-center gap-4">
        <div
          className={`p-3 rounded-full ${trend === "low" ? "bg-red-50 text-red-600" : "bg-neutral-100 text-neutral-600"}`}
        >
          <Icon className="h-5 w-5" />
        </div>
        <div>
          <p className="text-sm font-medium text-muted-foreground">{label}</p>
          <h3
            className={`text-2xl font-bold ${trend === "low" ? "text-red-600" : "text-foreground"}`}
          >
            {value}
          </h3>
          {subtext && (
            <p className="text-xs text-muted-foreground mt-0.5">{subtext}</p>
          )}
        </div>
      </CardContent>
    </Card>
  );
}
