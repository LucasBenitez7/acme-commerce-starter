"use client";

import { zodResolver } from "@hookform/resolvers/zod";
import { useRouter } from "next/navigation";
import { useEffect, useMemo, type ReactNode } from "react";
import { FormProvider, useForm, type DefaultValues } from "react-hook-form";

import { Button } from "@/components/ui/button";

import { productSchema, type ProductFormValues } from "@/lib/products/schema";
import { sortVariantsHelper } from "@/lib/products/utils";

import { useProductSubmit } from "@/hooks/products/use-product-submit";

type ProductWithId = ProductFormValues & { id: string };

type Props = {
  children: ReactNode;
  product?: Partial<ProductWithId> & { id?: string };
};

export function ProductFormProvider({ children, product }: Props) {
  const router = useRouter();
  const { isPending, onSubmit } = useProductSubmit(product?.id);

  const defaultValues: DefaultValues<ProductFormValues> = useMemo(() => {
    const sortedVariants = product?.variants
      ? sortVariantsHelper(product.variants)
      : [];

    return {
      name: product?.name || "",
      description: product?.description || "",
      priceCents: product?.priceCents || 0,
      categoryId: product?.categoryId || "",
      isArchived: product?.isArchived || false,
      slug: product?.slug || undefined,
      images: product?.images || [],
      variants: sortedVariants,
    };
  }, [product]);

  const methods = useForm<ProductFormValues>({
    resolver: zodResolver(productSchema) as any,
    defaultValues,
    mode: "onChange",
  });

  const {
    handleSubmit,
    reset,
    formState: { isDirty, errors },
  } = methods;

  useEffect(() => {
    if (product) {
      reset(defaultValues);
    }
  }, [product, reset, defaultValues]);

  useEffect(() => {
    const handleBeforeUnload = (e: BeforeUnloadEvent) => {
      if (isDirty && !isPending) {
        e.preventDefault();
      }
    };
    window.addEventListener("beforeunload", handleBeforeUnload);
    return () => window.removeEventListener("beforeunload", handleBeforeUnload);
  }, [isDirty, isPending]);

  const handleKeyDown = (e: React.KeyboardEvent) => {
    if (e.key === "Enter") {
      if ((e.target as HTMLElement).tagName !== "TEXTAREA") {
        e.preventDefault();
      }
    }
  };
  return (
    <FormProvider {...methods}>
      {errors.images?.message && (
        <div className="bg-red-50 border border-red-200 text-red-700 p-4 rounded-xs mb-4 animate-in fade-in">
          <p className="text-sm">{errors.images.message}</p>
        </div>
      )}

      <form
        onSubmit={handleSubmit(onSubmit)}
        onKeyDown={handleKeyDown}
        className="max-w-5xl mx-auto space-y-6"
      >
        {children}

        <div className="flex items-center lg:justify-end my-10 pb-4 border-b gap-3">
          <Button
            variant="outline"
            type="button"
            onClick={() => router.back()}
            className="py-3 lg:flex-0 flex-1"
            disabled={isPending}
          >
            Cancelar
          </Button>
          <Button
            type="submit"
            disabled={isPending}
            className="bg-black text-white py-3 lg:flex-0 flex-1"
          >
            {isPending ? "Guardando..." : "Guardar Producto"}
          </Button>
        </div>
      </form>
    </FormProvider>
  );
}
