import Link from "next/link";
import { notFound } from "next/navigation";
import { FaArrowLeft } from "react-icons/fa6";

import {
  getCategoryForEdit,
  getCategoryOrderList,
} from "@/lib/categories/queries";

import { CategoryForm } from "../_components/CategoryForm";
import { DeleteCategoryButton } from "../_components/DeleteCategoryButton";

interface Props {
  params: Promise<{ id: string }>;
}

export default async function EditCategoryPage({ params }: Props) {
  const { id } = await params;

  const [category, orderList] = await Promise.all([
    getCategoryForEdit(id),
    getCategoryOrderList(),
  ]);

  if (!category) {
    notFound();
  }

  const hasProducts = category._count.products > 0;

  return (
    <div className="max-w-5xl mx-auto space-y-6 py-2">
      <div className="flex items-center justify-between border-b pb-2">
        <Link
          href="/admin/categories"
          className="hover:bg-neutral-100 p-2 rounded-xs transition-colors"
        >
          <FaArrowLeft className="size-4" />
        </Link>

        <div className="space-y-1">
          <h1 className="text-2xl font-semibold tracking-tight">
            {category.name}
          </h1>
        </div>

        <DeleteCategoryButton id={category.id} hasProducts={hasProducts} />
      </div>

      <CategoryForm category={category} existingCategories={orderList} />
    </div>
  );
}
