import { notFound } from "next/navigation";

import { prisma } from "@/lib/db";

import { CategoryForm } from "../_components/CategoryForm";

export default async function EditCategoryPage({
  params,
}: {
  params: Promise<{ id: string }>;
}) {
  const { id } = await params;
  const category = await prisma.category.findUnique({ where: { id } });

  if (!category) notFound();

  return (
    <div className="space-y-6">
      <h1 className="text-2xl font-bold tracking-tight">Editar Categoría</h1>
      <CategoryForm category={category} />
    </div>
  );
}
