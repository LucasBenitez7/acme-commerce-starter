"use client";

import { zodResolver } from "@hookform/resolvers/zod";
import { useRouter } from "next/navigation";
import { useTransition } from "react";
import { useForm, FormProvider, type DefaultValues } from "react-hook-form";
import { FaBoxArchive } from "react-icons/fa6";
import { toast } from "sonner";

import { Button } from "@/components/ui/button";

import { productSchema, type ProductFormValues } from "@/lib/products/schema";

import { upsertProductAction } from "../actions";

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

export function ProductForm({
  categories,
  existingSizes,
  existingColors,
  product,
}: Props) {
  const router = useRouter();
  const [isPending, startTransition] = useTransition();

  const defaultValues: DefaultValues<ProductFormValues> = {
    name: product?.name || "",
    description: product?.description || "",
    priceCents: product?.priceCents || 0,
    categoryId: product?.categoryId || "",
    isArchived: product?.isArchived || false,
    slug: product?.slug || undefined,
    // Mapeamos para asegurar que coinciden con el esquema (especialmente opcionales)
    images:
      product?.images?.map((img) => ({
        id: img.id,
        url: img.url,
        color: img.color || null,
        sort: img.sort || 0,
        alt: img.alt || "",
      })) || [],
    variants:
      product?.variants?.map((v) => ({
        id: v.id,
        size: v.size,
        color: v.color,
        colorHex: v.colorHex || null,
        stock: v.stock || 0,
      })) || [],
  };

  const methods = useForm<ProductFormValues>({
    resolver: zodResolver(productSchema) as any,
    defaultValues,
    mode: "onChange",
  });

  const { handleSubmit } = methods;

  const onSubmit = (data: ProductFormValues) => {
    startTransition(async () => {
      const formData = new FormData();

      if (product?.id) formData.append("id", product.id);

      // Mapeo simple de campos
      formData.append("name", data.name);
      formData.append("description", data.description || "");
      formData.append("priceCents", String(data.priceCents));
      formData.append("categoryId", data.categoryId);
      formData.append("isArchived", String(data.isArchived));
      if (data.slug) formData.append("slug", data.slug);

      // SERIALIZACIÓN JSON (La clave para arrays complejos)
      formData.append("imagesJson", JSON.stringify(data.images));
      formData.append("variantsJson", JSON.stringify(data.variants));

      const result = await upsertProductAction({}, formData);

      if (result?.errors) {
        // Mostrar errores de servidor en un toast genérico o mapearlos
        toast.error("Error en el formulario. Revisa los campos.");
      } else if (result?.message) {
        toast.error(result.message);
      } else {
        toast.success("Producto guardado correctamente");
      }
    });
  };

  return (
    <FormProvider {...methods}>
      <h1 className="text-2xl font-bold">
        {product ? "Editar Producto" : "Nuevo Producto"}
      </h1>
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

        <VariantsSection
          suggestions={{ sizes: existingSizes, colors: existingColors }}
        />

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
