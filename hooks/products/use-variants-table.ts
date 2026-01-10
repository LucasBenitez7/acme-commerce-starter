import { useMemo } from "react";
import { useFieldArray, useFormContext } from "react-hook-form";
import { toast } from "sonner";

import type { ProductFormValues } from "@/lib/products/schema";

export function useVariantsTable() {
  const { control, getValues, trigger, watch } =
    useFormContext<ProductFormValues>();

  const { fields, append, remove } = useFieldArray({
    control,
    name: "variants",
    keyName: "keyId",
  });

  // Observamos los campos para poder agruparlos en tiempo real
  // 'fields' de useFieldArray a veces no tiene los valores actualizados de los inputs
  const variants = watch("variants");

  // AGRUPACIÓN: Creamos una estructura { "Rojo": [indices...], "Azul": [indices...] }
  // Usamos useMemo para que no recalcule en cada render si no cambian las variantes
  const groupedVariants = useMemo(() => {
    const groups: Record<string, number[]> = {};
    const colorOrder: string[] = []; // Para mantener el orden de creación de los grupos

    fields.forEach((field, index) => {
      // Usamos el valor real del form (variants[index]) o el del field si es inicial
      const colorName = variants?.[index]?.color || "Sin Color";

      if (!groups[colorName]) {
        groups[colorName] = [];
        colorOrder.push(colorName);
      }
      groups[colorName].push(index);
    });

    return { groups, colorOrder };
  }, [fields, variants]);

  // AÑADIR (Sin ordenar, solo append al final)
  const addVariants = (newItems: ProductFormValues["variants"]) => {
    const currentVariants = getValues("variants") || [];
    const variantsToAdd: typeof newItems = [];

    newItems.forEach((newItem) => {
      // Chequeo simple de duplicados
      const exists = currentVariants.some(
        (cv) => cv.size === newItem.size && cv.color === newItem.color,
      );
      if (!exists) variantsToAdd.push(newItem);
    });

    if (variantsToAdd.length === 0) {
      if (newItems.length > 0) toast.info("Esas variantes ya existen");
      return;
    }

    // AÑADIMOS AL FINAL (Orden de creación)
    append(variantsToAdd);

    setTimeout(() => trigger("variants"), 100);
    toast.success(`Añadidas ${variantsToAdd.length} nuevas variantes`);
  };

  const removeVariant = (index: number) => {
    remove(index);
    setTimeout(() => trigger("variants"), 50);
  };

  return {
    fields,
    groupedVariants, // Exportamos los grupos
    remove: removeVariant,
    addVariants, // Renombrado de addAndSort a addVariants
  };
}
