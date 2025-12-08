import { notFound } from "next/navigation";

import { prisma } from "@/lib/db";

import { ProductForm } from "@/app/(admin)/components/products/ProductForm";

export default async function EditProductPage({
  params,
}: {
  params: Promise<{ id: string }>;
}) {
  const { id } = await params;

  // 1. Buscar producto con todo lo necesario
  const product = await prisma.product.findUnique({
    where: { id },
    include: {
      images: { orderBy: { sort: "asc" } },
      variants: { orderBy: { size: "asc" } },
    },
  });

  if (!product) notFound();

  const categories = await prisma.category.findMany({
    select: { id: true, name: true },
    orderBy: { name: "asc" },
  });

  return (
    <div className="space-y-6">
      <h1 className="text-2xl font-bold tracking-tight">Editar Producto</h1>
      <ProductForm categories={categories} product={product} />
    </div>
  );
}
