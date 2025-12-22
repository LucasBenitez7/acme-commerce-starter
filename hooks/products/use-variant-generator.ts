import { useCallback } from "react";

import type { ProductFormValues } from "@/lib/products/schema";

type VariantItem = ProductFormValues["variants"][number];

export function useVariantGenerator() {
  const generateVariants = useCallback(
    (
      sizes: string[],
      colors: { name: string; hex: string }[],
      stock: number,
    ): VariantItem[] => {
      const newVariants: VariantItem[] = [];

      const sizeList = sizes.length > 0 ? sizes : ["UNICA"];
      const colorList =
        colors.length > 0 ? colors : [{ name: "UNICO", hex: "#000000" }];

      sizeList.forEach((size) => {
        colorList.forEach((color) => {
          // Evitamos generar "UNICA / UNICO" si ambos están vacíos
          if (size === "UNICA" && color.name === "UNICO") return;

          newVariants.push({
            size: size === "UNICA" ? "" : size,
            color: color.name === "UNICO" ? "" : color.name,
            colorHex: color.hex,
            stock: stock,
          });
        });
      });

      return newVariants;
    },
    [],
  );

  return { generateVariants };
}
