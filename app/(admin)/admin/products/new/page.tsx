import Link from "next/link";
import { FaArrowLeft } from "react-icons/fa6";

import { getProductFormDependencies } from "@/lib/products/service";

import { ProductForm } from "../_components/form/ProductForm";

export default async function NewProductPage() {
  const props = await getProductFormDependencies();

  return (
    <div className="max-w-5xl mx-auto space-y-6">
      <div className="flex items-center gap-2 border-b pb-2">
        <Link
          href="/admin/products"
          className="hover:bg-neutral-100 p-2 rounded-xs transition-colors"
        >
          <FaArrowLeft className="size-4" />
        </Link>

        <h1 className="text-2xl font-semibold tracking-tight flex-1 text-center mr-10">
          Nuevo Producto
        </h1>
      </div>

      <ProductForm {...props} />
    </div>
  );
}
