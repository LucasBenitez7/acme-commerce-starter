"use client";

import { useFieldArray, useFormContext } from "react-hook-form";
import { FaPlus, FaLayerGroup } from "react-icons/fa6";
import { toast } from "sonner";

import { Button } from "@/components/ui";

import { type ProductFormValues } from "@/lib/products/schema";

// Importamos el componente extraído
import { VariantGeneratorDialog } from "./VariantGeneratorDialog";

export function VariantsSection() {
  const {
    register,
    control,
    setValue,
    formState: { errors },
  } = useFormContext<ProductFormValues>();
  const { fields, append, remove } = useFieldArray({
    control,
    name: "variants",
  });

  const handleBulkGenerate = (newVars: any[]) => {
    const uniqueVars = newVars.filter(
      (nv) => !fields.some((f) => f.size === nv.size && f.color === nv.color),
    );

    if (uniqueVars.length === 0) return toast.info("Variantes ya existen.");

    append(uniqueVars);
    toast.success(`Añadidas ${uniqueVars.length} variantes.`);
  };

  return (
    <div className="bg-white p-6 rounded-lg border shadow-sm space-y-6">
      <div className="flex flex-col sm:flex-row justify-between items-center gap-4 pb-4 border-b">
        <div>
          <h3 className="text-lg font-medium flex items-center gap-2">
            <FaLayerGroup className="text-neutral-500" /> Inventario
          </h3>
          <p className="text-sm text-muted-foreground">Define combinaciones.</p>
        </div>
        <div className="flex gap-2">
          {/* Usamos el componente extraído */}
          <VariantGeneratorDialog onGenerate={handleBulkGenerate} />

          <Button
            type="button"
            variant="outline"
            onClick={() => append({ size: "", color: "", stock: 0 })}
          >
            <FaPlus className="mr-2" /> Manual
          </Button>
        </div>
      </div>

      {errors.variants && (
        <div className="p-3 bg-red-50 text-red-600 text-sm rounded border border-red-100">
          {errors.variants.message}
        </div>
      )}

      <div className="space-y-2">
        {fields.map((field, index) => (
          <div
            key={field.id}
            className="grid grid-cols-1 md:grid-cols-12 gap-3 items-center p-3 border rounded-md bg-white"
          >
            {/* ... Inputs de Talla, Color, Stock ... */}
            {/* ... Botón Delete ... */}
          </div>
        ))}
      </div>

      {fields.length === 0 && (
        <div className="py-12 border-2 border-dashed rounded text-center text-neutral-400">
          No hay variantes.
        </div>
      )}
    </div>
  );
}
