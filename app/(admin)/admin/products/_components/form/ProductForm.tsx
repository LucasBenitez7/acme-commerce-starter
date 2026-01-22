"use client";

import { type ProductFormValues } from "@/lib/products/schema";

import { ProductFormProvider } from "./ProductFormProvider";
import { DangerZone, GeneralSection, VariantsSection } from "./sections";
import { ImagesSection } from "./sections/ImagesSection";

type ProductWithId = ProductFormValues & { id: string };

type Props = {
  categories: { id: string; name: string }[];
  product?: Partial<ProductWithId> & { id?: string };
};

export function ProductForm({ categories, product }: Props) {
  return (
    <div>
      <ProductFormProvider product={product}>
        <GeneralSection categories={categories} />

        <VariantsSection />

        <ImagesSection />
      </ProductFormProvider>

      {product?.id && product.name && (
        <DangerZone
          productId={product.id}
          productName={product.name}
          isArchived={!!product.isArchived}
        />
      )}
    </div>
  );
}
