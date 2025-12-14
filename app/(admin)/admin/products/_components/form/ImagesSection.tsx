"use client";

import Image from "next/image";
import { useFieldArray, useFormContext } from "react-hook-form";
import { FaPlus, FaTrash, FaImage } from "react-icons/fa6";

import { Button, Input } from "@/components/ui";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";

import type { ProductFormValues } from "@/lib/validation/product";

export function ImagesSection() {
  const { register, control, watch, setValue } =
    useFormContext<ProductFormValues>();
  const { fields, append, remove } = useFieldArray({ control, name: "images" });

  // Observamos las variantes para obtener los colores disponibles dinámicamente
  const variants = watch("variants") || [];
  const availableColors = Array.from(
    new Set(variants.map((v) => v.color).filter(Boolean)),
  );

  return (
    <div className="bg-white p-6 rounded-lg border shadow-sm">
      <div className="flex justify-between items-center mb-4">
        <h3 className="text-lg font-medium">Imágenes</h3>
        <Button
          type="button"
          variant="outline"
          size="sm"
          onClick={() => append({ url: "", sort: fields.length })}
        >
          <FaPlus className="mr-2" /> URL
        </Button>
      </div>

      <div className="space-y-3">
        {fields.map((field, index) => {
          // Obtenemos el valor actual del campo para mostrar preview y controlar select
          const currentColor = watch(`images.${index}.color`);
          const currentUrl = watch(`images.${index}.url`);

          return (
            <div
              key={field.id}
              className="flex gap-3 items-center p-3 border rounded bg-neutral-50/30"
            >
              <div className="h-10 w-10 bg-white border rounded shrink-0 overflow-hidden flex items-center justify-center relative">
                {currentUrl ? (
                  // eslint-disable-next-line @next/next/no-img-element
                  <img
                    src={currentUrl}
                    alt="Preview"
                    className="h-full w-full object-cover"
                  />
                ) : (
                  <FaImage className="text-gray-300" />
                )}
              </div>

              <div className="flex-1 grid grid-cols-1 sm:grid-cols-2 gap-3">
                <Input
                  {...register(`images.${index}.url`)}
                  placeholder="https://..."
                  className="h-9 text-xs"
                />

                <Select
                  value={currentColor || "all"}
                  onValueChange={(val) =>
                    setValue(
                      `images.${index}.color`,
                      val === "all" ? null : val,
                    )
                  }
                >
                  <SelectTrigger className="h-9 text-xs">
                    <SelectValue placeholder="Asignar a color" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="all">Todas</SelectItem>
                    {availableColors.map((c) => (
                      <SelectItem key={c} value={c}>
                        {c}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>

              <Button
                type="button"
                variant="ghost"
                size="icon"
                onClick={() => remove(index)}
              >
                <FaTrash className="text-red-500 h-4 w-4" />
              </Button>
            </div>
          );
        })}
      </div>
    </div>
  );
}
