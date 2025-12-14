import { notFound } from "next/navigation";

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
      images: { orderBy: { sort: "asc" } },
      variants: { orderBy: { size: "asc" } },
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

  return (
    <div className="space-y-6">
      <ProductForm
        categories={categories}
        product={product}
        existingSizes={existingSizes}
        existingColors={existingColors}
      />
    </div>
  );
}
