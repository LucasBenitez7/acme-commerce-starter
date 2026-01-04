import { getCategoryOrderList } from "@/lib/categories/queries";

import { CategoryForm } from "../_components/CategoryForm";

export default async function NewCategoryPage() {
  const orderList = await getCategoryOrderList();

  return (
    <div className="max-w-4xl mx-auto space-y-6 py-2">
      <div className="border-b pb-4">
        <h1 className="text-2xl font-semibold tracking-tight">
          Nueva Categoría
        </h1>
      </div>
      <CategoryForm existingCategories={orderList} />
    </div>
  );
}
