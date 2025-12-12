import { notFound } from "next/navigation";

import { prisma } from "@/lib/db";

import { CategoryForm } from "../_components/CategoryForm";
import { DeleteCategoryButton } from "../_components/DeleteCategoryButton";

interface Props {
  params: Promise<{ id: string }>;
}

export default async function EditCategoryPage({ params }: Props) {
  const { id } = await params;

  // 1. Incluimos _count para saber si tiene productos asociados
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

  // Calculamos si tiene productos para pasarle al botón
  const hasProducts = category._count.products > 0;

  return (
    <div className="max-w-2xl mx-auto space-y-6">
      <div className="flex items-center justify-between border-b border-slate-200 pb-4">
        <div>
          <h1 className="text-xl font-semibold">Editar Categoría</h1>
          <p className="text-slate-500 text-sm font-medium">
            Modifica los detalles de {category.name}
          </p>
        </div>
        {/* Aquí colocamos el botón de borrar alineado a la derecha */}
        <DeleteCategoryButton id={category.id} hasProducts={hasProducts} />
      </div>

      <div className="bg-white border border-slate-200 rounded-xs shadow-sm p-6">
        <CategoryForm category={category} />
      </div>
    </div>
  );
}
