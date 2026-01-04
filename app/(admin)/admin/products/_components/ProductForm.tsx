"use client";

import { zodResolver } from "@hookform/resolvers/zod";
import { useRouter } from "next/navigation";
import { useForm, FormProvider, type DefaultValues } from "react-hook-form";
import { FaBoxArchive } from "react-icons/fa6";

import { Button } from "@/components/ui/button";

import { productSchema, type ProductFormValues } from "@/lib/products/schema";

import { useProductSubmit } from "@/hooks/products/use-product-submit";

import { DangerZone } from "./form/DangerZone";
import { GeneralSection } from "./form/GeneralSection";
import { ImagesSection } from "./form/ImagesSection";
import { VariantsSection } from "./form/VariantsSection";

type ProductWithId = ProductFormValues & { id: string };

type Props = {
  categories: { id: string; name: string }[];
  existingSizes: string[];
  existingColors: string[];
  product?: Partial<ProductWithId> & { id?: string };
};

export function ProductForm({ categories, product }: Props) {
  const router = useRouter();
  const { isPending, onSubmit } = useProductSubmit(product?.id);

  const defaultValues: DefaultValues<ProductFormValues> = {
    name: product?.name || "",
    description: product?.description || "",
    priceCents: product?.priceCents || 0,
    categoryId: product?.categoryId || "",
    isArchived: product?.isArchived || false,
    slug: product?.slug || undefined,
    images: product?.images || [],
    variants: product?.variants || [],
  };

  const methods = useForm<ProductFormValues>({
    resolver: zodResolver(productSchema) as any,
    defaultValues,
    mode: "onChange",
  });

  const {
    handleSubmit,
    formState: { errors },
  } = methods;

  return (
    <FormProvider {...methods}>
      <h1 className="text-2xl font-bold">
        {product?.id ? "Editar Producto" : "Nuevo Producto"}
      </h1>
      {errors.images?.message && (
        <div className="bg-red-50 border border-red-200 text-red-700 p-4 rounded-md flex items-center gap-3 animate-in slide-in-from-top-2">
          <div>
            <p className="text-sm">{errors.images.message}</p>
          </div>
        </div>
      )}
      <form
        onSubmit={handleSubmit(onSubmit)}
        className="max-w-5xl mx-auto space-y-8"
      >
        {/* Banner Archivado */}
        {product?.isArchived && (
          <div className="bg-amber-50 border-l-4 border-amber-500 p-4 rounded-r flex items-center gap-3">
            <FaBoxArchive className="text-amber-600" />
            <div>
              <p className="font-bold text-amber-800">Producto Archivado</p>
              <p className="text-sm text-amber-700">
                No es visible en la tienda.
              </p>
            </div>
          </div>
        )}

        {/* SECCIONES DEL FORMULARIO */}
        <GeneralSection categories={categories} />

        <VariantsSection />

        <ImagesSection />

        <div className="flex items-center justify-end">
          <div className="flex gap-3">
            <Button
              variant="outline"
              type="button"
              onClick={() => router.back()}
            >
              Cancelar
            </Button>
            <Button
              type="submit"
              disabled={isPending}
              className="bg-black text-white"
            >
              {isPending ? "Guardando..." : "Guardar Producto"}
            </Button>
          </div>
        </div>
      </form>

      {/* ZONA DE PELIGRO (Solo edición) */}
      {product?.id && product.name && (
        <div className="max-w-5xl mx-auto mb-6">
          <DangerZone
            productId={product.id}
            productName={product.name}
            isArchived={!!product.isArchived}
          />
        </div>
      )}
    </FormProvider>
  );
}
