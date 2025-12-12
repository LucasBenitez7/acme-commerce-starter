import { prisma } from "@/lib/db";

import { ProductForm } from "../_components/ProductForm";

export default async function NewProductPage() {
  const categories = await prisma.category.findMany({
    select: { id: true, name: true },
    orderBy: { name: "asc" },
  });

  const variantsData = await prisma.productVariant.findMany({
    select: { size: true, color: true },
    distinct: ["size", "color"], // Truco para sacar únicos (aunque sacará combinaciones, lo filtraremos en JS)
  });

  // Extraemos listas únicas
  const existingSizes = Array.from(new Set(variantsData.map((v) => v.size)));
  const existingColors = Array.from(new Set(variantsData.map((v) => v.color)));

  return (
    <div className="space-y-6">
      <h1 className="text-2xl font-bold tracking-tight">Nuevo Producto</h1>
      <ProductForm
        categories={categories}
        existingSizes={existingSizes}
        existingColors={existingColors}
      />
    </div>
  );
}
