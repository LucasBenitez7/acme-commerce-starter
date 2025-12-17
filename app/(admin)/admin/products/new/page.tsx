import { prisma } from "@/lib/db";

import { ProductForm } from "../_components/ProductForm";

export default async function NewProductPage() {
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
    <div className="max-w-5xl mx-auto space-y-6">
      <ProductForm
        categories={categories}
        existingSizes={existingSizes}
        existingColors={existingColors}
      />
    </div>
  );
}
