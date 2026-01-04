"use client";

import { useState, useEffect } from "react";
import { FaPalette, FaTags, FaWandMagicSparkles } from "react-icons/fa6";
import { toast } from "sonner";

import { Button, Input, Label } from "@/components/ui";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogDescription,
  DialogFooter,
  DialogTrigger,
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
import { capitalize } from "@/lib/products/utils";
import { cn } from "@/lib/utils";

import { useVariantGenerator } from "@/hooks/products/use-variant-generator";

type Props = {
  onGenerate: (variants: any[]) => void;
};

export function VariantGeneratorDialog({ onGenerate }: Props) {
  const [open, setOpen] = useState(false);
  const { generateVariants } = useVariantGenerator();

  const [selectedPresetColor, setSelectedPresetColor] = useState("custom");
  const [genSizes, setGenSizes] = useState<string[]>([]);
  const [genColorName, setGenColorName] = useState("");
  const [genColorHex, setGenColorHex] = useState("#000000");
  const [genStock, setGenStock] = useState(10);

  // Sincronizar presets de color
  useEffect(() => {
    if (selectedPresetColor !== "custom") {
      const preset = PRODUCT_COLORS.find((c) => c.name === selectedPresetColor);
      if (preset) {
        setGenColorName(preset.name);
        setGenColorHex(preset.hex);
      }
    } else {
    }
  }, [selectedPresetColor]);

  const handleGenerateClick = () => {
    if (!genColorName.trim()) return toast.error("Elige un color.");
    if (genSizes.length === 0) return toast.error("Elige tallas.");

    const newVars = generateVariants(
      genSizes,
      [{ name: capitalize(genColorName), hex: genColorHex }],
      genStock,
    );

    onGenerate(newVars);
    setOpen(false);
    setGenSizes([]);
  };

  const toggleSize = (s: string) => {
    setGenSizes((prev) =>
      prev.includes(s) ? prev.filter((x) => x !== s) : [...prev, s],
    );
  };

  return (
    <Dialog open={open} onOpenChange={setOpen}>
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
          <DialogTitle>Generador Masivo</DialogTitle>
          <DialogDescription>Crea combinaciones rápidamente.</DialogDescription>
        </DialogHeader>

        <div className="space-y-6 py-4">
          {/* SECCIÓN COLOR */}
          <div className="bg-neutral-50 p-4 rounded-md border space-y-3">
            <Label className="flex items-center gap-2">
              <FaPalette /> Color
            </Label>
            <div className="grid gap-3">
              <Select
                value={selectedPresetColor}
                onValueChange={setSelectedPresetColor}
              >
                <SelectTrigger className="bg-white">
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="custom">✨ Personalizado</SelectItem>
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
                <div
                  className="relative w-10 h-10 rounded-full border-2 border-white shadow ring-1 ring-neutral-200"
                  style={{ background: genColorHex }}
                >
                  <input
                    type="color"
                    className="absolute inset-0 opacity-0 cursor-pointer w-full h-full"
                    value={genColorHex}
                    onChange={(e) => {
                      setGenColorHex(e.target.value);
                      setSelectedPresetColor("custom");
                    }}
                  />
                </div>
                <Input
                  placeholder="Nombre del color"
                  value={genColorName}
                  onChange={(e) => {
                    setGenColorName(e.target.value);
                    setSelectedPresetColor("custom");
                  }}
                  onBlur={() => setGenColorName(capitalize(genColorName))}
                />
              </div>
            </div>
          </div>

          {/* SECCIÓN TALLAS */}
          <div className="space-y-3">
            <Label className="flex items-center gap-2">
              <FaTags /> Tallas
            </Label>
            <div className="border p-4 rounded-md space-y-4">
              <div>
                <span className="text-xs font-bold text-neutral-400 uppercase mb-2 block">
                  Ropa
                </span>
                <div className="flex flex-wrap gap-2">
                  {CLOTHING_SIZES.map((s) => (
                    <div
                      key={s}
                      onClick={() => toggleSize(s)}
                      className={cn(
                        "cursor-pointer px-3 py-1 text-sm border rounded",
                        genSizes.includes(s)
                          ? "bg-black text-white"
                          : "bg-white",
                      )}
                    >
                      {s}
                    </div>
                  ))}
                </div>
              </div>
              <Separator />
              <div>
                <span className="text-xs font-bold text-neutral-400 uppercase mb-2 block">
                  Calzado
                </span>
                <div className="flex flex-wrap gap-2">
                  {SHOE_SIZES.map((s) => (
                    <div
                      key={s}
                      onClick={() => toggleSize(s)}
                      className={cn(
                        "cursor-pointer px-3 py-1 text-sm border rounded",
                        genSizes.includes(s)
                          ? "bg-black text-white"
                          : "bg-white",
                      )}
                    >
                      {s}
                    </div>
                  ))}
                </div>
              </div>
            </div>
          </div>

          {/* STOCK */}
          <div className="space-y-2">
            <Label>Stock Inicial</Label>
            <Input
              type="number"
              min="0"
              value={genStock}
              onChange={(e) => setGenStock(Number(e.target.value))}
            />
          </div>
        </div>

        <DialogFooter>
          <Button variant="outline" onClick={() => setOpen(false)}>
            Cancelar
          </Button>
          <Button onClick={handleGenerateClick}>Generar</Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}
