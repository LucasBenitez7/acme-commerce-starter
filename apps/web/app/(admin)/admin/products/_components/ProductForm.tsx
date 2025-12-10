"use client";

import { useState, useEffect, useMemo, useActionState } from "react";
import { FaBoxArchive } from "react-icons/fa6";
import { toast } from "sonner";

import { Button } from "@/components/ui/button";

import {
  createProductAction,
  updateProductAction,
  type ProductFormState,
} from "../actions";

import {
  DangerZone,
  GeneralSection,
  ImagesSection,
  VariantsSection,
} from "./form";

import type {
  FormVariant,
  FormImage,
  Category,
  ProductWithDetails,
} from "./form/types";

type Props = {
  categories: Category[];
  existingSizes: string[];
  existingColors: string[];
  product?: ProductWithDetails;
};

const INITIAL_STATE: ProductFormState = {};

export function ProductForm({
  categories,
  existingSizes,
  existingColors,
  product,
}: Props) {
  const isEditing = !!product;
  const action = isEditing
    ? updateProductAction.bind(null, product.id)
    : createProductAction;
  const [state, formAction, isPending] = useActionState(action, INITIAL_STATE);

  // Estados
  const [variants, setVariants] = useState<FormVariant[]>(
    product?.variants || [{ size: "", color: "", colorHex: "", stock: 0 }],
  );
  const [images, setImages] = useState<FormImage[]>(
    product?.images || [{ url: "", color: null }],
  );

  // Colores activos para el select de imágenes
  const activeColors = useMemo(() => {
    return Array.from(new Set(variants.map((v) => v.color).filter(Boolean)));
  }, [variants]);

  // Manejo de errores
  useEffect(() => {
    if (state.message) toast.error(state.message);
    if (state.errors) {
      const allErrors = Object.values(state.errors).flatMap(
        (errs) => errs || [],
      );
      if (typeof allErrors[0] === "string") toast.error(allErrors[0]);
    }
  }, [state]);

  const handlePreSubmit = (e: React.FormEvent) => {
    const invalidVariants = variants.some(
      (v) => !v.size.trim() || !v.color.trim(),
    );
    if (invalidVariants) {
      e.preventDefault();
      toast.error("Hay variantes incompletas.");
      return;
    }
    const invalidImages = images.some((i) => !i.url.trim());
    if (invalidImages) {
      e.preventDefault();
      toast.error("Hay imágenes sin URL.");
      return;
    }
    if (variants.length === 0) {
      e.preventDefault();
      toast.error("Añade al menos una variante.");
      return;
    }
  };

  return (
    <div className="max-w-5xl mx-auto pb-20">
      {/* Banner de Archivado */}
      {product?.isArchived && (
        <div className="mb-6 bg-amber-50 border-l-4 border-amber-500 p-4 rounded-r shadow-sm flex items-center gap-3">
          <FaBoxArchive className="text-amber-600" />
          <div>
            <p className="font-bold text-amber-800">Producto Archivado</p>
            <p className="text-sm text-amber-700">Este producto está oculto.</p>
          </div>
        </div>
      )}

      <form
        action={formAction}
        className="space-y-8"
        onSubmit={handlePreSubmit}
      >
        <GeneralSection
          categories={categories}
          defaultValues={product}
          errors={state.errors}
        />

        <VariantsSection
          variants={variants}
          setVariants={setVariants}
          suggestions={{ sizes: existingSizes, colors: existingColors }}
        />

        <ImagesSection
          images={images}
          setImages={setImages}
          availableColors={activeColors}
        />

        {/* Footer flotante */}
        <div className="flex items-center justify-end gap-4 pt-6 sticky bottom-0 bg-white/90 backdrop-blur p-4 border-t mt-8 z-10 shadow-lg border-x rounded-t-lg">
          <Button
            type="button"
            variant="outline"
            onClick={() => window.history.back()}
          >
            Cancelar
          </Button>
          <Button
            type="submit"
            className="bg-black text-white px-8"
            disabled={isPending}
          >
            {isPending
              ? "Guardando..."
              : isEditing
                ? "Guardar Cambios"
                : "Crear Producto"}
          </Button>
        </div>
      </form>

      {isEditing && product && (
        <DangerZone
          productId={product.id}
          productName={product.name}
          isArchived={product.isArchived}
        />
      )}
    </div>
  );
}
