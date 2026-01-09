import { useFieldArray, useFormContext } from "react-hook-form";
import { toast } from "sonner";

import { sortVariantsHelper } from "@/lib/products/utils";

import type { ProductFormValues } from "@/lib/products/schema";

export function useVariantsTable() {
  const { control, getValues, trigger } = useFormContext<ProductFormValues>();

  const { fields, replace, remove, insert } = useFieldArray({
    control,
    name: "variants",
    keyName: "keyId",
  });

  const addAndSort = (newItems: ProductFormValues["variants"]) => {
    const currentVariants = getValues("variants") || [];
    const variantsToAdd: typeof newItems = [];

    newItems.forEach((newItem) => {
      const exists = currentVariants.some(
        (cv) => cv.size === newItem.size && cv.color === newItem.color,
      );
      if (!exists) variantsToAdd.push(newItem);
    });

    if (variantsToAdd.length === 0) {
      if (newItems.length > 0) toast.info("Esas variantes ya existen");
      return;
    }

    const allVariants = [...currentVariants, ...variantsToAdd];

    replace(sortVariantsHelper(allVariants));

    setTimeout(() => trigger("variants"), 100);
    toast.success(`Añadidas ${variantsToAdd.length} nuevas variantes`);
  };

  const duplicateVariant = (index: number) => {
    const currentVariant = getValues(`variants.${index}`);
    const { id, ...rest } = currentVariant;

    const newVariant = {
      ...rest,
      size: "",
      stock: 0,
    };

    insert(index + 1, newVariant);
    toast.info("Fila duplicada. Ingresa la talla.");
  };

  const removeVariant = (index: number) => {
    remove(index);
    setTimeout(() => trigger("variants"), 50);
  };

  return {
    fields,
    remove: removeVariant,
    addAndSort,
    duplicateVariant,
  };
}
