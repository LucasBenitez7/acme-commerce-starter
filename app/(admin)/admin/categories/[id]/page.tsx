import { notFound } from "next/navigation";
import { FaLayerGroup } from "react-icons/fa6";

import { prisma } from "@/lib/db";

import { CategoryForm } from "../_components/CategoryForm";
import { DeleteCategoryButton } from "../_components/DeleteCategoryButton";

interface Props {
  params: Promise<{ id: string }>;
}

export default async function EditCategoryPage({ params }: Props) {
  const { id } = await params;

  const category = await prisma.category.findUnique({
    where: { id },
    include: {
      _count: {
        select: { products: true },
      },
    },
  });

  if (!category) {
    notFound();
  }

  const hasProducts = category._count.products > 0;

  return (
    <div className="max-w-xl mx-auto space-y-8">
      {/* HEADER SIMPLE */}
      <div className="flex items-start justify-between border-b pb-6">
        <div className="space-y-1">
          <div className="flex items-center gap-2 text-sm text-muted-foreground">
            <FaLayerGroup />
            <span>Editar Categoría</span>
          </div>
          <h1 className="text-2xl font-bold tracking-tight">{category.name}</h1>
        </div>

        {/* Pasamos el botón que me mostraste antes */}
        <DeleteCategoryButton id={category.id} hasProducts={hasProducts} />
      </div>

      {/* FORMULARIO */}
      <CategoryForm category={category} />
    </div>
  );
}
