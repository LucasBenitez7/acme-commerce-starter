"use client";

import { useState } from "react";
import { useFieldArray, useFormContext } from "react-hook-form";
import {
  FaPlus,
  FaTrash,
  FaWandMagicSparkles,
  FaTags,
  FaPalette,
  FaLayerGroup,
} from "react-icons/fa6";
import { toast } from "sonner";

import { Button, Input, Label } from "@/components/ui";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
  DialogFooter,
  DialogDescription,
} from "@/components/ui/dialog";
import { Separator } from "@/components/ui/separator";

import { CLOTHING_SIZES, SHOE_SIZES } from "@/lib/constants";
import { type ProductFormValues } from "@/lib/products/schema";
import { cn } from "@/lib/utils";

import { useVariantGenerator } from "@/hooks/use-variant-generator";

type Props = {
  suggestions: { sizes: string[]; colors: string[] };
};

export function VariantsSection({ suggestions }: Props) {
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

  const { generateVariants } = useVariantGenerator();

  // --- ESTADO LOCAL DEL GENERADOR ---
  const [openGenerator, setOpenGenerator] = useState(false);
  const [genSizes, setGenSizes] = useState<string[]>([]);
  const [genColor, setGenColor] = useState("");
  const [genColorHex, setGenColorHex] = useState("#000000");
  const [genStock, setGenStock] = useState(10);

  const handleGenerate = () => {
    if (!genColor)
      return toast.error(
        "Por favor, escribe un nombre para el color (ej: Rojo)",
      );
    if (genSizes.length === 0)
      return toast.error("Selecciona al menos una talla");

    const newVars = generateVariants(
      genSizes,
      [{ name: genColor, hex: genColorHex }],
      genStock,
    );

    append(newVars);
    setOpenGenerator(false);
    // Limpiamos solo las tallas para facilitar agregar otro color
    setGenSizes([]);
    toast.success(`${newVars.length} variantes añadidas`);
  };

  const toggleSize = (s: string) => {
    setGenSizes((prev) =>
      prev.includes(s) ? prev.filter((x) => x !== s) : [...prev, s],
    );
  };

  return (
    <div className="bg-white p-6 rounded-lg border shadow-sm space-y-6">
      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4 pb-4 border-b">
        <div>
          <h3 className="text-lg font-medium flex items-center gap-2">
            <FaLayerGroup className="text-neutral-500" />
            Inventario y Variantes
          </h3>
          <p className="text-sm text-muted-foreground">
            Define las combinaciones de talla, color y cantidad disponible.
          </p>
        </div>

        <div className="flex gap-2 w-full sm:w-auto">
          {/* --- MODAL GENERADOR --- */}
          <Dialog open={openGenerator} onOpenChange={setOpenGenerator}>
            <DialogTrigger asChild>
              <Button
                type="button"
                className="bg-black text-white flex-1 sm:flex-none"
              >
                <FaWandMagicSparkles className="mr-2 text-purple-300" />
                Generador Mágico
              </Button>
            </DialogTrigger>
            <DialogContent className="max-w-xl max-h-[90vh] overflow-y-auto">
              <DialogHeader>
                <DialogTitle>Generador Masivo de Variantes</DialogTitle>
                <DialogDescription>
                  Crea combinaciones rápidamente seleccionando tallas y un
                  color.
                </DialogDescription>
              </DialogHeader>

              <div className="space-y-6 py-4">
                {/* 1. Configuración de Color */}
                <div className="bg-neutral-50 p-4 rounded-md border space-y-3">
                  <Label className="flex items-center gap-2">
                    <FaPalette /> Configuración del Color
                  </Label>
                  <div className="flex gap-3 items-center">
                    <div className="relative group cursor-pointer">
                      <div
                        className="w-10 h-10 rounded-full border-2 border-white shadow-sm"
                        style={{ backgroundColor: genColorHex }}
                      />
                      <input
                        type="color"
                        className="absolute inset-0 opacity-0 cursor-pointer w-full h-full"
                        value={genColorHex}
                        onChange={(e) => setGenColorHex(e.target.value)}
                      />
                    </div>
                    <div className="flex-1">
                      <Input
                        placeholder="Nombre del color (Ej: Azul Marino)"
                        value={genColor}
                        onChange={(e) => setGenColor(e.target.value)}
                      />
                    </div>
                  </div>
                </div>

                {/* 2. Configuración de Tallas */}
                <div className="space-y-3">
                  <Label className="flex items-center gap-2">
                    <FaTags /> Selecciona las Tallas
                  </Label>

                  <div className="space-y-2">
                    <span className="text-xs font-semibold text-muted-foreground uppercase tracking-wider">
                      Ropa
                    </span>
                    <div className="flex flex-wrap gap-2">
                      {CLOTHING_SIZES.map((size) => (
                        <div
                          key={size}
                          onClick={() => toggleSize(size)}
                          className={cn(
                            "cursor-pointer px-3 py-1.5 rounded-md text-sm border transition-all select-none",
                            genSizes.includes(size)
                              ? "bg-neutral-900 text-white border-neutral-900"
                              : "bg-white text-neutral-700 hover:border-neutral-400",
                          )}
                        >
                          {size}
                        </div>
                      ))}
                    </div>
                  </div>

                  <Separator className="my-2" />

                  <div className="space-y-2">
                    <span className="text-xs font-semibold text-muted-foreground uppercase tracking-wider">
                      Calzado
                    </span>
                    <div className="flex flex-wrap gap-2">
                      {SHOE_SIZES.map((size) => (
                        <div
                          key={size}
                          onClick={() => toggleSize(size)}
                          className={cn(
                            "cursor-pointer px-3 py-1.5 rounded-md text-sm border transition-all select-none",
                            genSizes.includes(size)
                              ? "bg-neutral-900 text-white border-neutral-900"
                              : "bg-white text-neutral-700 hover:border-neutral-400",
                          )}
                        >
                          {size}
                        </div>
                      ))}
                    </div>
                  </div>
                </div>

                {/* 3. Stock Inicial */}
                <div className="space-y-2">
                  <Label>Stock inicial para estas variantes</Label>
                  <Input
                    type="number"
                    min="0"
                    value={genStock}
                    onChange={(e) => setGenStock(Number(e.target.value))}
                  />
                </div>
              </div>

              <DialogFooter>
                <Button
                  type="button"
                  variant="outline"
                  onClick={() => setOpenGenerator(false)}
                >
                  Cancelar
                </Button>
                <Button type="button" onClick={handleGenerate}>
                  Confirmar y Generar
                </Button>
              </DialogFooter>
            </DialogContent>
          </Dialog>

          <Button
            type="button"
            variant="outline"
            className="flex-1 sm:flex-none"
            onClick={() => append({ size: "", color: "", stock: 0 })}
          >
            <FaPlus className="mr-2" /> Manual
          </Button>
        </div>
      </div>

      {errors.variants && (
        <div className="p-3 bg-red-50 border border-red-100 rounded text-red-600 text-sm">
          ⚠️ {errors.variants.message || "Revisa las variantes, hay errores."}
        </div>
      )}

      {/* --- TABLA DE EDICIÓN --- */}
      <div className="space-y-2">
        {/* Header Desktop */}
        <div className="hidden md:grid grid-cols-12 gap-4 text-xs font-semibold text-neutral-500 uppercase px-3 py-2 bg-neutral-50 rounded-t-md border-b">
          <div className="col-span-3">Talla</div>
          <div className="col-span-5">Color (Hex + Nombre)</div>
          <div className="col-span-3">Stock</div>
          <div className="col-span-1 text-center">Acción</div>
        </div>

        <div className="space-y-2">
          {fields.map((field, index) => {
            return (
              <div
                key={field.id}
                className="grid grid-cols-1 md:grid-cols-12 gap-3 items-center p-3 border rounded-md bg-white hover:shadow-sm transition-shadow relative"
              >
                {/* Mobile Label */}
                <div className="md:hidden text-xs font-bold text-neutral-400 uppercase mb-1">
                  Talla
                </div>

                {/* TALLA INPUT */}
                <div className="col-span-3">
                  <Input
                    {...register(`variants.${index}.size`)}
                    placeholder="Ej: XL"
                    className="uppercase font-medium"
                    // Forzar mayúsculas visualmente y al escribir
                    onChange={(e) => {
                      setValue(
                        `variants.${index}.size`,
                        e.target.value.toUpperCase(),
                      );
                    }}
                  />
                  {errors.variants?.[index]?.size && (
                    <span className="text-[10px] text-red-500 mt-1 block">
                      Requerido
                    </span>
                  )}
                </div>

                {/* Mobile Label */}
                <div className="md:hidden text-xs font-bold text-neutral-400 uppercase mt-2 mb-1">
                  Color
                </div>

                {/* COLOR INPUTS */}
                <div className="col-span-5 flex gap-2 items-center">
                  <div className="relative group shrink-0">
                    <div className="w-10 h-10 rounded border shadow-sm overflow-hidden">
                      <input
                        type="color"
                        className="w-[150%] h-[150%] -m-[25%] cursor-pointer p-0 border-0"
                        {...register(`variants.${index}.colorHex`)}
                      />
                    </div>
                  </div>
                  <div className="flex-1">
                    <Input
                      {...register(`variants.${index}.color`)}
                      placeholder="Nombre color"
                    />
                  </div>
                </div>

                {/* Mobile Label */}
                <div className="md:hidden text-xs font-bold text-neutral-400 uppercase mt-2 mb-1">
                  Stock
                </div>

                {/* STOCK INPUT */}
                <div className="col-span-3">
                  <Input
                    type="number"
                    min="0"
                    {...register(`variants.${index}.stock`, {
                      valueAsNumber: true,
                    })}
                    placeholder="0"
                  />
                  {errors.variants?.[index]?.stock && (
                    <span className="text-[10px] text-red-500 mt-1 block">
                      Mínimo 0
                    </span>
                  )}
                </div>

                {/* DELETE BUTTON */}
                <div className="col-span-1 flex justify-end md:justify-center mt-2 md:mt-0">
                  <Button
                    type="button"
                    variant="ghost"
                    size="icon"
                    onClick={() => remove(index)}
                    className="text-neutral-400 hover:text-red-600 hover:bg-red-50"
                  >
                    <FaTrash className="h-4 w-4" />
                  </Button>
                </div>
              </div>
            );
          })}
        </div>

        {fields.length === 0 && (
          <div className="flex flex-col items-center justify-center py-12 border-2 border-dashed rounded-lg bg-neutral-50/50 text-neutral-400">
            <FaLayerGroup className="h-10 w-10 mb-3 opacity-20" />
            <p>No has añadido variantes.</p>
            <p className="text-sm">Usa el generador o añade una manualmente.</p>
          </div>
        )}
      </div>
    </div>
  );
}
