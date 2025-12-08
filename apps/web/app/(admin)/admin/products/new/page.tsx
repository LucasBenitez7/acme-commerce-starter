import { prisma } from "@/lib/db";

import { ProductForm } from "@/app/(admin)/components/products/ProductForm";

export default async function NewProductPage() {
  const categories = await prisma.category.findMany({
    select: { id: true, name: true },
    orderBy: { name: "asc" },
  });

  return (
    <div className="space-y-6">
      <h1 className="text-2xl font-bold tracking-tight">Nuevo Producto</h1>
      <ProductForm categories={categories} />
    </div>
  );
}
