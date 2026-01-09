"use client";

import { type ProductFormValues } from "@/lib/products/schema";

import { ProductFormProvider } from "./ProductFormProvider";
import {
  DangerZone,
  GeneralSection,
  ImagesSection,
  VariantsSection,
} from "./sections";

type ProductWithId = ProductFormValues & { id: string };

type Props = {
  categories: { id: string; name: string }[];
  product?: Partial<ProductWithId> & { id?: string };
};

export function ProductForm({ categories, product }: Props) {
  return (
    <ProductFormProvider product={product}>
      <GeneralSection categories={categories} />

      <VariantsSection />

      <ImagesSection />

      {product?.id && product.name && (
        <div className="pt-6">
          <DangerZone
            productId={product.id}
            productName={product.name}
            isArchived={!!product.isArchived}
          />
        </div>
      )}
    </ProductFormProvider>
  );
}
