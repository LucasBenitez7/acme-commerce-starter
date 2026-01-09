import { getProductFormDependencies } from "@/lib/products/service";

import { ProductForm } from "../_components/form/ProductForm";

export default async function NewProductPage() {
  const props = await getProductFormDependencies();

  return (
    <div className="max-w-5xl mx-auto space-y-6">
      <ProductForm {...props} />
    </div>
  );
}
