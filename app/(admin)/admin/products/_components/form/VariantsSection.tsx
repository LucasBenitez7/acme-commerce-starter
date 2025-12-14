"use client";

import { useState } from "react";
import { useFieldArray, useFormContext } from "react-hook-form";
import { FaPlus, FaTrash, FaWandMagicSparkles } from "react-icons/fa6";
import { toast } from "sonner";

import { Button, Input, Label, Checkbox } from "@/components/ui";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
  DialogFooter,
} from "@/components/ui/dialog";

import { PRODUCT_COLORS, CLOTHING_SIZES, SHOE_SIZES } from "@/lib/constants";
import { type ProductFormValues } from "@/lib/validation/product";

import { useVariantGenerator } from "@/hooks/use-variant-generator";

type Props = {
  suggestions: { sizes: string[]; colors: string[] };
};

export function VariantsSection({ suggestions }: Props) {
  const {
    register,
    control,
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
    if (!genColor) return toast.error("Selecciona un color");

    const newVars = generateVariants(
      genSizes,
      [{ name: genColor, hex: genColorHex }],
      genStock,
    );

    append(newVars);
    setOpenGenerator(false);
    setGenSizes([]);
    toast.success(`${newVars.length} variantes añadidas`);
  };

  const toggleSize = (s: string) => {
    setGenSizes((prev) =>
      prev.includes(s) ? prev.filter((x) => x !== s) : [...prev, s],
    );
  };

  return (
    <div className="bg-white p-6 rounded-lg border shadow-sm space-y-4">
      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
        <div>
          <h3 className="text-lg font-medium">Inventario y Variantes</h3>
          <p className="text-sm text-muted-foreground">
            Gestiona tallas, colores y stock
          </p>
        </div>

        <div className="flex gap-2">
          {/* --- MODAL GENERADOR --- */}
          <Dialog open={openGenerator} onOpenChange={setOpenGenerator}>
            <DialogTrigger asChild>
              <Button type="button" className="bg-black text-white">
                <FaWandMagicSparkles className="mr-2 text-purple-300" />{" "}
                Generador
              </Button>
            </DialogTrigger>
            <DialogContent className="max-w-xl">
              <DialogHeader>
                <DialogTitle>Generador Masivo</DialogTitle>
              </DialogHeader>

              <div className="space-y-4 py-4">
                {/* 1. Color */}
                <div className="space-y-2">
                  <Label>Color Principal</Label>
                  <div className="flex gap-2 items-center">
                    <div className="h-10 w-10 border rounded overflow-hidden relative">
                      <input
                        type="color"
                        className="absolute -top-2 -left-2 w-16 h-16 cursor-pointer"
                        value={genColorHex}
                        onChange={(e) => setGenColorHex(e.target.value)}
                      />
                    </div>
                    <Input
                      placeholder="Nombre (Ej: Rojo)"
                      value={genColor}
                      onChange={(e) => setGenColor(e.target.value)}
                    />
                  </div>
                </div>

                {/* 2. Tallas */}
                <div className="space-y-2">
                  <Label>Tallas</Label>
                  <div className="flex flex-wrap gap-2 p-3 bg-neutral-50 rounded border">
                    {[...CLOTHING_SIZES, ...SHOE_SIZES].map((size) => (
                      <div
                        key={size}
                        className="flex items-center gap-2 bg-white px-2 py-1 rounded border"
                      >
                        <Checkbox
                          id={`gs-${size}`}
                          checked={genSizes.includes(size)}
                          onCheckedChange={() => toggleSize(size)}
                        />
                        <label
                          htmlFor={`gs-${size}`}
                          className="text-sm cursor-pointer"
                        >
                          {size}
                        </label>
                      </div>
                    ))}
                  </div>
                </div>

                {/* 3. Stock */}
                <div className="space-y-2">
                  <Label>Stock por variante</Label>
                  <Input
                    type="number"
                    value={genStock}
                    onChange={(e) => setGenStock(Number(e.target.value))}
                  />
                </div>
              </div>

              <DialogFooter>
                <Button type="button" onClick={handleGenerate}>
                  Generar Variantes
                </Button>
              </DialogFooter>
            </DialogContent>
          </Dialog>

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
        <p className="text-red-500 text-sm">{errors.variants.message}</p>
      )}

      {/* TABLA DE VARIANTES */}
      <div className="space-y-2">
        <div className="grid grid-cols-12 gap-2 text-xs font-medium text-muted-foreground px-2 bg-neutral-100 py-2 rounded">
          <div className="col-span-3">TALLA</div>
          <div className="col-span-5">COLOR</div>
          <div className="col-span-3">STOCK</div>
          <div className="col-span-1"></div>
        </div>

        {fields.map((field, index) => (
          <div
            key={field.id}
            className="grid grid-cols-12 gap-2 items-center p-2 border-b last:border-0"
          >
            <div className="col-span-3">
              <Input
                {...register(`variants.${index}.size`)}
                className="h-8 uppercase"
                placeholder="Talla"
              />
              {errors.variants?.[index]?.size && (
                <span className="text-[10px] text-red-500">Requerido</span>
              )}
            </div>
            <div className="col-span-5 flex gap-2">
              <div className="w-8 h-8 border rounded overflow-hidden relative shrink-0">
                <input
                  type="color"
                  className="absolute -top-2 -left-2 w-12 h-12 cursor-pointer"
                  {...register(`variants.${index}.colorHex`)}
                />
              </div>
              <Input
                {...register(`variants.${index}.color`)}
                className="h-8"
                placeholder="Color"
              />
            </div>
            <div className="col-span-3">
              <Input
                type="number"
                {...register(`variants.${index}.stock`)}
                className="h-8"
              />
            </div>
            <div className="col-span-1 flex justify-center">
              <Button
                type="button"
                variant="ghost"
                size="icon"
                onClick={() => remove(index)}
                className="h-8 w-8 text-red-500 hover:bg-red-50"
              >
                <FaTrash className="h-3.5 w-3.5" />
              </Button>
            </div>
          </div>
        ))}

        {fields.length === 0 && (
          <div className="text-center py-8 text-muted-foreground border border-dashed rounded bg-neutral-50">
            No hay variantes. Usa el generador o añade una manual.
          </div>
        )}
      </div>
    </div>
  );
}
