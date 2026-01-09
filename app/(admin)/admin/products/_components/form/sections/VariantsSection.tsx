"use client";

import { useFormContext } from "react-hook-form";
import {
  FaTrash,
  FaLayerGroup,
  FaClone,
  FaTriangleExclamation,
} from "react-icons/fa6";

import { Button, Input } from "@/components/ui";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";

import { type ProductFormValues } from "@/lib/products/schema";
import { capitalize } from "@/lib/products/utils";
import { cn } from "@/lib/utils";

import { useVariantsTable } from "@/hooks/products/use-variants-table";

import { VariantGeneratorDialog } from "../dialogs/VariantGeneratorDialog";

export function VariantsSection() {
  const {
    register,
    setValue,
    trigger,
    formState: { errors },
  } = useFormContext<ProductFormValues>();

  const { fields, remove, addAndSort, duplicateVariant } = useVariantsTable();

  return (
    <div className="bg-background p-4 rounded-xs border shadow-sm space-y-6">
      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4 border-b pb-3">
        <h3 className="text-lg font-medium flex items-center gap-2">
          <FaLayerGroup className="text-neutral-500" /> Inventario y Variantes
        </h3>

        <VariantGeneratorDialog onGenerate={addAndSort} />
      </div>

      {errors.variants && !Array.isArray(errors.variants) && (
        <div className="p-3 bg-red-50 text-red-600 text-sm rounded-xs border border-red-100 flex items-center gap-2 animate-in fade-in">
          <FaTriangleExclamation />
          {(errors.variants as any).message}
        </div>
      )}

      <div className="rounded-xs border overflow-hidden">
        <Table>
          <TableHeader className="bg-neutral-50">
            <TableRow>
              <TableHead className="w-[140px]">Talla</TableHead>
              <TableHead className="min-w-[200px]">Color</TableHead>
              <TableHead className="w-[120px]">Stock</TableHead>
              <TableHead className="w-[100px] text-right">Acciones</TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {fields.map((field, index) => {
              const rowError = errors.variants?.[index];
              const isDuplicate = rowError?.size?.message === "Duplicado";

              return (
                <TableRow
                  key={field.keyId || field.id}
                  className={cn(
                    "group transition-colors border-none hover:bg-neutral-50/50",
                  )}
                >
                  {/* 1. TALLA */}
                  <TableCell className="relative align-top">
                    <Input
                      {...register(`variants.${index}.size`)}
                      placeholder="Ej: XL"
                      className={cn(
                        "uppercase font-medium h-9 transition-all",
                        rowError?.size &&
                          "border-red-500 focus-visible:ring-red-500 bg-white",
                      )}
                      onChange={(e) => {
                        setValue(
                          `variants.${index}.size`,
                          e.target.value.toUpperCase(),
                        );
                        trigger("variants");
                      }}
                    />
                    {rowError?.size && (
                      <span className="text-[10px] text-red-600 font-bold mt-1 block">
                        {rowError.size.message}
                      </span>
                    )}
                  </TableCell>

                  {/* 2. COLOR */}
                  <TableCell className="align-top relative">
                    <div className="flex gap-2 items-center">
                      <div
                        className={cn(
                          "h-9 w-9 rounded-xs border shadow-sm overflow-hidden shrink-0 relative cursor-pointer hover:border-neutral-400 transition-colors",
                          rowError?.color && "border-red-500",
                        )}
                      >
                        <input
                          type="color"
                          className="absolute inset-0 w-[150%] h-[150%] -m-[25%] cursor-pointer p-0 border-0"
                          {...register(`variants.${index}.colorHex`)}
                        />
                      </div>
                      <div className="w-full">
                        <Input
                          {...register(`variants.${index}.color`)}
                          placeholder="Nombre"
                          className={cn(
                            "h-9",
                            rowError?.color &&
                              "border-red-500 focus-visible:ring-red-500 bg-white",
                          )}
                          onBlur={(e) => {
                            setValue(
                              `variants.${index}.color`,
                              capitalize(e.target.value),
                            );
                            trigger("variants");
                          }}
                        />
                      </div>
                    </div>
                    {rowError?.color && (
                      <span className="text-[10px] text-red-600 font-bold mt-1 block">
                        {rowError.color.message === "Duplicado"
                          ? "Repetido"
                          : rowError.color.message}
                      </span>
                    )}
                  </TableCell>

                  {/* 3. STOCK */}
                  <TableCell className="align-top relative">
                    <Input
                      type="number"
                      min="0"
                      className={cn(
                        "h-9",
                        rowError?.stock &&
                          "border-red-500 focus-visible:ring-red-500 bg-white",
                      )}
                      {...register(`variants.${index}.stock`)}
                      onChange={(e) => {
                        setValue(
                          `variants.${index}.stock`,
                          e.target.valueAsNumber,
                        );
                        trigger(`variants.${index}.stock`);
                      }}
                    />
                    {rowError?.stock && (
                      <span className="text-[10px] text-red-600 font-bold mt-1 block">
                        {rowError.stock.message}
                      </span>
                    )}
                  </TableCell>

                  {/* 4. ACCIONES */}
                  <TableCell className="text-right align-top">
                    <div className="flex justify-end gap-1">
                      <Button
                        type="button"
                        variant="ghost"
                        size="icon"
                        onMouseDown={(e) => {
                          e.preventDefault();
                          duplicateVariant(index);
                        }}
                        className="h-9 w-9 text-neutral-400 hover:text-blue-600 hover:bg-blue-50"
                        title="Duplicar fila"
                      >
                        <FaClone className="size-4" />
                      </Button>

                      <Button
                        type="button"
                        variant="ghost"
                        size="icon"
                        onMouseDown={(e) => {
                          e.preventDefault();
                          remove(index);
                        }}
                        className="h-9 w-9 text-neutral-400 hover:text-red-600 hover:bg-red-50"
                        title="Eliminar fila"
                      >
                        <FaTrash className="size-4" />
                      </Button>
                    </div>
                  </TableCell>
                </TableRow>
              );
            })}

            {fields.length === 0 && (
              <TableRow>
                <TableCell
                  colSpan={4}
                  className="h-32 text-center text-neutral-400"
                >
                  <div className="flex flex-col items-center justify-center gap-2">
                    <FaLayerGroup className="h-8 w-8 opacity-20" />
                    <p>No hay variantes añadidas</p>
                    <p className="text-xs mt-1">
                      Usa el generador para añadir variantes
                    </p>
                  </div>
                </TableCell>
              </TableRow>
            )}
          </TableBody>
        </Table>
      </div>
    </div>
  );
}
