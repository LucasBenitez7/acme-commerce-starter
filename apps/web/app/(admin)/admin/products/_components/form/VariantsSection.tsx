"use client";

import { useState, useMemo } from "react";
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
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";

import { CLOTHING_SIZES, SHOE_SIZES, PRODUCT_COLORS } from "@/lib/constants";

import type { FormVariant } from "./types";

type Props = {
  variants: FormVariant[];
  setVariants: (v: FormVariant[]) => void;
  suggestions: { sizes: string[]; colors: string[] };
};

export function VariantsSection({ variants, setVariants, suggestions }: Props) {
  const ALL_SIZES = useMemo(
    () =>
      Array.from(
        new Set([...CLOTHING_SIZES, ...SHOE_SIZES, ...suggestions.sizes]),
      ),
    [suggestions.sizes],
  );
  const ALL_COLORS = useMemo(() => {
    const constantNames = PRODUCT_COLORS.map((c) => c.name);
    return Array.from(new Set([...constantNames, ...suggestions.colors]));
  }, [suggestions.colors]);

  // --- ESTADOS LOCALES DEL GENERADOR ---
  const [openGenerator, setOpenGenerator] = useState(false);
  const [quickColorMode, setQuickColorMode] = useState<"preset" | "custom">(
    "preset",
  );
  const [quickColor, setQuickColor] = useState("");
  const [quickColorHex, setQuickColorHex] = useState("#000000");
  const [quickSizes, setQuickSizes] = useState<string[]>([]);
  const [quickStock, setQuickStock] = useState(10);
  const [customSizeInput, setCustomSizeInput] = useState("");

  const duplicatesMap = useMemo(() => {
    const counts: Record<string, number> = {};
    variants.forEach((v) => {
      const key = `${v.size.toLowerCase().trim()}-${v.color.toLowerCase().trim()}`;
      counts[key] = (counts[key] || 0) + 1;
    });
    return counts;
  }, [variants]);

  // --- ACTIONS ---
  const addVariant = () =>
    setVariants([...variants, { size: "", color: "", colorHex: "", stock: 0 }]);
  const removeVariant = (idx: number) =>
    setVariants(variants.filter((_, i) => i !== idx));

  const updateVariant = (idx: number, field: keyof FormVariant, value: any) => {
    const next = [...variants];
    if (field === "color") {
      const known = PRODUCT_COLORS.find((c) => c.name === value);
      if (known) next[idx].colorHex = known.hex;
    }
    next[idx] = { ...next[idx], [field]: value };
    setVariants(next);
  };

  // --- GENERADOR ---
  const handleQuickGenerate = () => {
    if (!quickColor) return toast.error("Selecciona un color");
    if (quickSizes.length === 0) return toast.error("Selecciona tallas");

    const newVariants = quickSizes.map((size) => ({
      size,
      color: quickColor,
      colorHex: quickColorHex,
      stock: quickStock,
    }));

    setVariants([...variants, ...newVariants]);
    setOpenGenerator(false);
    setQuickSizes([]);
    toast.success(`${newVariants.length} variantes añadidas`);
  };

  const toggleQuickSize = (size: string) => {
    setQuickSizes((prev) =>
      prev.includes(size) ? prev.filter((s) => s !== size) : [...prev, size],
    );
  };

  const handleGenColorPresetChange = (val: string) => {
    if (val === "custom") {
      setQuickColorMode("custom");
      setQuickColor("");
      setQuickColorHex("#ff0000");
    } else {
      setQuickColorMode("preset");
      setQuickColor(val);
      const found = PRODUCT_COLORS.find((c) => c.name === val);
      if (found) setQuickColorHex(found.hex);
    }
  };

  const addCustomSize = () => {
    if (!customSizeInput.trim()) return;
    if (!quickSizes.includes(customSizeInput)) {
      setQuickSizes([...quickSizes, customSizeInput]);
    }
    setCustomSizeInput("");
  };

  return (
    <div className="bg-white p-6 rounded-xs border shadow-sm">
      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center mb-6 gap-4">
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
              <Button
                type="button"
                className="bg-black text-white hover:bg-neutral-800"
              >
                <FaWandMagicSparkles className="mr-2 text-purple-300" />{" "}
                Generador Masivo
              </Button>
            </DialogTrigger>
            <DialogContent className="max-w-xl">
              <DialogHeader>
                <DialogTitle>Generador de Variantes</DialogTitle>
              </DialogHeader>
              <div className="space-y-6 py-4">
                {/* A. COLOR */}
                <div className="space-y-3">
                  <Label>1. Elige un Color</Label>
                  <div className="flex gap-3 items-end">
                    <div className="flex-1">
                      {quickColorMode === "preset" ? (
                        <Select
                          value={quickColor}
                          onValueChange={handleGenColorPresetChange}
                        >
                          <SelectTrigger>
                            <SelectValue placeholder="Colores estándar" />
                          </SelectTrigger>
                          <SelectContent>
                            {PRODUCT_COLORS.map((c) => (
                              <SelectItem key={c.name} value={c.name}>
                                <div className="flex items-center gap-2">
                                  <div
                                    className="w-3 h-3 rounded-full border"
                                    style={{ background: c.hex }}
                                  />{" "}
                                  {c.name}
                                </div>
                              </SelectItem>
                            ))}
                            <SelectItem
                              value="custom"
                              className="font-medium text-blue-600"
                            >
                              + Personalizado
                            </SelectItem>
                          </SelectContent>
                        </Select>
                      ) : (
                        <div className="flex gap-2">
                          <Input
                            value={quickColor}
                            onChange={(e) => setQuickColor(e.target.value)}
                            placeholder="Nombre (Ej: Lima)"
                            autoFocus
                          />
                          <Button
                            variant="ghost"
                            onClick={() => setQuickColorMode("preset")}
                            size="sm"
                          >
                            Cancelar
                          </Button>
                        </div>
                      )}
                    </div>
                    <div className="h-10 w-10 rounded border overflow-hidden relative shrink-0">
                      <input
                        type="color"
                        className="absolute -top-2 -left-2 w-16 h-16 cursor-pointer"
                        value={quickColorHex}
                        onChange={(e) => setQuickColorHex(e.target.value)}
                      />
                    </div>
                  </div>
                </div>

                {/* B. TALLAS */}
                <div className="space-y-3">
                  <Label>2. Marca las tallas</Label>
                  <div className="p-4 border rounded-xs bg-neutral-50">
                    {/* Lista de presets */}
                    <div className="flex flex-wrap gap-3 mb-4">
                      {[...CLOTHING_SIZES, ...SHOE_SIZES].map((size) => (
                        <div
                          key={size}
                          className="flex items-center space-x-2 bg-white px-3 py-1.5 rounded border border-neutral-200"
                        >
                          <Checkbox
                            id={`size-${size}`}
                            checked={quickSizes.includes(size)}
                            onCheckedChange={() => toggleQuickSize(size)}
                          />
                          <label
                            htmlFor={`size-${size}`}
                            className="text-sm cursor-pointer"
                          >
                            {size}
                          </label>
                        </div>
                      ))}

                      {/* Mostrar tallas custom seleccionadas también */}
                      {quickSizes
                        .filter(
                          (s) =>
                            ![...CLOTHING_SIZES, ...SHOE_SIZES].includes(s),
                        )
                        .map((size) => (
                          <div
                            key={size}
                            className="flex items-center space-x-2 bg-blue-50 border-blue-200 px-3 py-1.5 rounded border"
                          >
                            <Checkbox
                              checked={true}
                              onCheckedChange={() => toggleQuickSize(size)}
                            />
                            <label className="text-sm font-medium text-blue-700">
                              {size}
                            </label>
                          </div>
                        ))}
                    </div>

                    {/* Input para Talla Personalizada */}
                    <div className="flex items-end gap-2 pt-2 border-t">
                      <div className="flex-1 space-y-1">
                        <Label className="text-xs text-muted-foreground">
                          ¿Otra talla?
                        </Label>
                        <Input
                          placeholder="Ej: 4XL, 120cm..."
                          className="h-8 text-sm"
                          value={customSizeInput}
                          onChange={(e) => setCustomSizeInput(e.target.value)}
                          onKeyDown={(e) => {
                            if (e.key === "Enter") {
                              e.preventDefault();
                              addCustomSize();
                            }
                          }}
                        />
                      </div>
                      <Button
                        type="button"
                        variant="secondary"
                        size="sm"
                        onClick={addCustomSize}
                      >
                        Añadir
                      </Button>
                    </div>
                  </div>
                </div>

                {/* C. STOCK */}
                <div className="space-y-2">
                  <Label>3. Stock Inicial</Label>
                  <Input
                    type="number"
                    value={quickStock}
                    onChange={(e) => setQuickStock(Number(e.target.value))}
                    min={0}
                  />
                </div>

                <DialogFooter>
                  <Button
                    type="button"
                    onClick={handleQuickGenerate}
                    className="w-full sm:w-auto"
                  >
                    Generar
                  </Button>
                </DialogFooter>
              </div>
            </DialogContent>
          </Dialog>

          <Button
            type="button"
            variant="outline"
            size="sm"
            onClick={addVariant}
          >
            <FaPlus className="mr-2" /> Fila Manual
          </Button>
        </div>
      </div>

      {/* TABLA DE VARIANTES */}
      <div className="space-y-2">
        <div className="grid grid-cols-12 gap-2 text-xs font-medium text-muted-foreground px-2 bg-neutral-100 py-2 rounded mb-2">
          <div className="col-span-3 pl-2">TALLA</div>
          <div className="col-span-5">COLOR</div>
          <div className="col-span-3">STOCK</div>
          <div className="col-span-1"></div>
        </div>

        {variants.length === 0 && (
          <p className="text-center text-sm text-muted-foreground py-8 border border-dashed rounded-xs">
            No hay variantes. Usa el generador.
          </p>
        )}

        {variants.map((v, idx) => {
          const key = `${v.size.toLowerCase().trim()}-${v.color.toLowerCase().trim()}`;
          const isDuplicate = duplicatesMap[key] > 1;

          return (
            <div
              key={idx}
              className={`grid grid-cols-12 gap-2 items-center p-2 border-b last:border-0 transition-colors ${isDuplicate ? "bg-red-50 border-red-200" : "hover:bg-neutral-50"}`}
            >
              <div className="col-span-3 relative">
                <Input
                  value={v.size}
                  onChange={(e) => updateVariant(idx, "size", e.target.value)}
                  className={`h-8 uppercase ${isDuplicate ? "border-red-500" : ""}`}
                  required
                  list={`list-sizes-${idx}`}
                />
                {/* DATALIST CON SUGERENCIAS DE DB + CONSTANTES */}
                <datalist id={`list-sizes-${idx}`}>
                  {ALL_SIZES.map((s) => (
                    <option key={s} value={s} />
                  ))}
                </datalist>
              </div>

              <div className="col-span-5 flex gap-2 relative">
                <div className="relative w-8 h-8 rounded border overflow-hidden shrink-0">
                  <input
                    type="color"
                    className="absolute -top-1 -left-1 w-10 h-10 p-0 border-0 cursor-pointer"
                    value={v.colorHex || "#000000"}
                    onChange={(e) =>
                      updateVariant(idx, "colorHex", e.target.value)
                    }
                  />
                </div>
                <Input
                  value={v.color}
                  onChange={(e) => updateVariant(idx, "color", e.target.value)}
                  className={`h-8 ${isDuplicate ? "border-red-500" : ""}`}
                  required
                  list={`list-colors-${idx}`}
                />
                {/* DATALIST CON COLORES DE DB + CONSTANTES */}
                <datalist id={`list-colors-${idx}`}>
                  {ALL_COLORS.map((c) => (
                    <option key={c} value={c} />
                  ))}
                </datalist>
              </div>

              <div className="col-span-3">
                <Input
                  type="number"
                  value={v.stock}
                  onChange={(e) => updateVariant(idx, "stock", e.target.value)}
                  min={0}
                  className="h-8"
                  required
                />
              </div>

              <div className="col-span-1 flex justify-center">
                <Button
                  type="button"
                  variant="ghost"
                  size="icon"
                  onClick={() => removeVariant(idx)}
                  className="h-8 w-8 text-red-500 hover:bg-red-50"
                >
                  <FaTrash className="h-3.5 w-3.5" />
                </Button>
              </div>

              {isDuplicate && (
                <div className="col-span-12 text-[10px] text-red-600 font-medium pl-2">
                  Variante duplicada
                </div>
              )}
            </div>
          );
        })}
      </div>
      <input
        type="hidden"
        name="variantsJson"
        value={JSON.stringify(variants)}
      />
    </div>
  );
}
