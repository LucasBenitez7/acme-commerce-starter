"use client";

import { useState, useEffect } from "react";
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
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Separator } from "@/components/ui/separator";

import { CLOTHING_SIZES, SHOE_SIZES, PRODUCT_COLORS } from "@/lib/constants";
import { type ProductFormValues } from "@/lib/products/schema";
import { capitalize } from "@/lib/products/utils";
import { cn } from "@/lib/utils";

import { useVariantGenerator } from "@/hooks/products/use-variant-generator";

type Props = {
  suggestions: { sizes: string[]; colors: string[] };
};

export function VariantsSection({ suggestions }: Props) {
  const {
    register,
    control,
    setValue,
    watch,
    formState: { errors },
  } = useFormContext<ProductFormValues>();

  const { fields, append, remove } = useFieldArray({
    control,
    name: "variants",
  });

  const { generateVariants } = useVariantGenerator();

  const [openGenerator, setOpenGenerator] = useState(false);

  const [selectedPresetColor, setSelectedPresetColor] =
    useState<string>("custom");

  const [genSizes, setGenSizes] = useState<string[]>([]);
  const [genColorName, setGenColorName] = useState("");
  const [genColorHex, setGenColorHex] = useState("#000000");
  const [genStock, setGenStock] = useState(10);

  useEffect(() => {
    if (selectedPresetColor !== "custom") {
      const preset = PRODUCT_COLORS.find((c) => c.name === selectedPresetColor);
      if (preset) {
        setGenColorName(preset.name);
        setGenColorHex(preset.hex);
      }
    } else {
      if (PRODUCT_COLORS.some((c) => c.name === genColorName)) {
        setGenColorName("");
        setGenColorHex("#000000");
      }
    }
  }, [selectedPresetColor]);

  const handleGenerate = () => {
    // 1. Validaciones
    if (!genColorName.trim())
      return toast.error("Por favor, escribe o selecciona un color.");

    if (genSizes.length === 0)
      return toast.error("Selecciona al menos una talla.");

    const finalColorName = capitalize(genColorName.trim());

    // 2. Generación
    const newVars = generateVariants(
      genSizes,
      [{ name: finalColorName, hex: genColorHex }],
      genStock,
    );

    const uniqueVars = newVars.filter((newVar) => {
      const exists = fields.some(
        (existingField) =>
          existingField.size === newVar.size &&
          existingField.color === newVar.color,
      );
      return !exists;
    });

    if (uniqueVars.length === 0) {
      toast.info("Esas variantes ya existen en la lista.");
      return;
    }

    append(uniqueVars);

    setOpenGenerator(false);
    setGenSizes([]);
    if (uniqueVars.length < newVars.length) {
      toast.success(
        `Añadidas ${uniqueVars.length} variantes (se omitieron duplicados).`,
      );
    } else {
      toast.success(`${uniqueVars.length} variantes añadidas.`);
    }
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
                {/* 1. CONFIGURACIÓN DE COLOR (MEJORADA) */}
                <div className="bg-neutral-50 p-4 rounded-md border space-y-3">
                  <Label className="flex items-center gap-2">
                    <FaPalette /> Configuración del Color
                  </Label>

                  <div className="grid gap-3">
                    {/* Selector de Presets */}
                    <Select
                      value={selectedPresetColor}
                      onValueChange={setSelectedPresetColor}
                    >
                      <SelectTrigger className="bg-white">
                        <SelectValue placeholder="Elige un color base o personalizado" />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="custom">
                          ✨ Color Personalizado
                        </SelectItem>
                        {PRODUCT_COLORS.filter((c) => c.name !== "Default").map(
                          (c) => (
                            <SelectItem key={c.name} value={c.name}>
                              <div className="flex items-center gap-2">
                                <div
                                  className="w-3 h-3 rounded-full border"
                                  style={{ background: c.hex }}
                                />
                                {c.name}
                              </div>
                            </SelectItem>
                          ),
                        )}
                      </SelectContent>
                    </Select>

                    <div className="flex gap-3 items-center">
                      {/* Picker Visual */}
                      <div className="relative group cursor-pointer shrink-0">
                        <div
                          className="w-10 h-10 rounded-full border-2 border-white shadow-sm ring-1 ring-neutral-200"
                          style={{ backgroundColor: genColorHex }}
                        />
                        {/* Solo permitimos cambiar el HEX si es Custom, o dejamos que lo cambien siempre para ajustar el tono */}
                        <input
                          type="color"
                          className="absolute inset-0 opacity-0 cursor-pointer w-full h-full"
                          value={genColorHex}
                          onChange={(e) => {
                            setGenColorHex(e.target.value);
                            // Si cambia el hex manualmente, pasamos a custom visualmente para evitar confusiones
                            if (selectedPresetColor !== "custom")
                              setSelectedPresetColor("custom");
                          }}
                        />
                      </div>

                      {/* Input de Nombre */}
                      <div className="flex-1">
                        <Input
                          placeholder="Nombre del color (Ej: Azul Marino)"
                          value={genColorName}
                          onChange={(e) => {
                            setGenColorName(e.target.value);
                            if (selectedPresetColor !== "custom")
                              setSelectedPresetColor("custom");
                          }}
                          // Capitalización visual al perder foco (onBlur)
                          onBlur={() =>
                            setGenColorName((prev) => capitalize(prev))
                          }
                        />
                      </div>
                    </div>
                  </div>
                </div>

                {/* 2. CONFIGURACIÓN DE TALLAS (Reutiliza tus constantes) */}
                <div className="space-y-3">
                  <Label className="flex items-center gap-2">
                    <FaTags /> Selecciona las Tallas
                  </Label>

                  <div className="space-y-4 border p-4 rounded-md">
                    {/* ROPA */}
                    <div>
                      <span className="text-xs font-bold text-neutral-400 uppercase tracking-wider mb-2 block">
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

                    <Separator />

                    {/* CALZADO */}
                    <div>
                      <span className="text-xs font-bold text-neutral-400 uppercase tracking-wider mb-2 block">
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
                </div>

                {/* 3. STOCK INICIAL */}
                <div className="space-y-2">
                  <Label>Stock inicial por variante</Label>
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
          {errors.variants.message || "Revisa las variantes, hay errores."}
        </div>
      )}

      {/* --- TABLA DE EDICIÓN (VISUAL MEJORADA) --- */}
      <div className="space-y-2">
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
                {/* TALLA */}
                <div className="col-span-3">
                  <span className="md:hidden text-xs font-bold text-neutral-400 uppercase mb-1 block">
                    Talla
                  </span>
                  <Input
                    {...register(`variants.${index}.size`)}
                    placeholder="Ej: XL"
                    className="uppercase font-medium"
                    onChange={(e) => {
                      setValue(
                        `variants.${index}.size`,
                        e.target.value.toUpperCase(),
                      );
                    }}
                  />
                </div>

                {/* COLOR */}
                <div className="col-span-5">
                  <span className="md:hidden text-xs font-bold text-neutral-400 uppercase mb-1 block">
                    Color
                  </span>
                  <div className="flex gap-2 items-center">
                    <div className="w-10 h-10 rounded border shadow-sm overflow-hidden shrink-0 relative">
                      <input
                        type="color"
                        className="absolute inset-0 w-[150%] h-[150%] -m-[25%] cursor-pointer p-0 border-0"
                        {...register(`variants.${index}.colorHex`)}
                      />
                    </div>
                    <Input
                      {...register(`variants.${index}.color`)}
                      placeholder="Nombre"
                      // Capitalizar al editar manualmente también
                      onBlur={(e) => {
                        setValue(
                          `variants.${index}.color`,
                          capitalize(e.target.value),
                        );
                      }}
                    />
                  </div>
                </div>

                {/* STOCK */}
                <div className="col-span-3">
                  <span className="md:hidden text-xs font-bold text-neutral-400 uppercase mb-1 block">
                    Stock
                  </span>
                  <Input
                    type="number"
                    min="0"
                    {...register(`variants.${index}.stock`, {
                      valueAsNumber: true,
                    })}
                  />
                </div>

                {/* DELETE */}
                <div className="col-span-1 flex justify-end md:justify-center">
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
          </div>
        )}
      </div>
    </div>
  );
}
