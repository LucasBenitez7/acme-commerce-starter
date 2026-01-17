import { useState, useEffect, useCallback, useMemo } from "react";
import { toast } from "sonner";

import { capitalize, sortSizes } from "@/lib/products/utils";

import {
  getPresetSizes,
  getPresetColors,
  createPresetSize,
  createPresetColor,
  deletePresetSize,
  deletePresetColor,
} from "@/app/(admin)/admin/products/_action/attributes-actions";
import { useVariantGenerator } from "@/hooks/products/use-variant-generator";

import type { ProductFormValues } from "@/lib/products/schema";
import type { PresetSize, PresetColor } from "@/lib/products/types";

type UseVariantDialogProps = {
  onGenerate: (variants: ProductFormValues["variants"]) => void;
};

// REGEX PARA VALIDAR HEXADECIMAL (Seguridad)
const HEX_REGEX = /^#([0-9A-F]{3}){1,2}$/i;

export function useVariantDialog({ onGenerate }: UseVariantDialogProps) {
  const { generateVariants } = useVariantGenerator();
  const [open, setOpen] = useState(false);

  // --- ESTADOS DE LA DB
  const [rawSizes, setRawSizes] = useState<PresetSize[]>([]);
  const [rawColors, setRawColors] = useState<PresetColor[]>([]);
  const [isLoadingAttributes, setIsLoadingAttributes] = useState(false);

  // --- ESTADOS DE UI
  const [isColorEditMode, setIsColorEditMode] = useState(false);
  const [isSizeEditMode, setIsSizeEditMode] = useState(false);
  const [isCustomizingColor, setIsCustomizingColor] = useState(false);
  const [duplicateError, setDuplicateError] = useState<string | null>(null);

  // --- ESTADOS DEL FORMULARIO
  const [selectedPresetColor, setSelectedPresetColor] = useState("custom");
  const [genSizes, setGenSizes] = useState<string[]>([]);
  const [genColorName, setGenColorName] = useState("");
  const [genColorHex, setGenColorHex] = useState("#000000");
  const [genStock, setGenStock] = useState(10);
  const [customSizeInput, setCustomSizeInput] = useState("");

  // Cargar datos
  const loadAttributes = useCallback(async () => {
    setIsLoadingAttributes(true);
    try {
      const [sizes, colors] = await Promise.all([
        getPresetSizes(),
        getPresetColors(),
      ]);
      setRawSizes(sizes as PresetSize[]);
      setRawColors(colors as PresetColor[]);
    } catch (e) {
      console.error(e);
      toast.error("Error cargando atributos guardados");
    } finally {
      setIsLoadingAttributes(false);
    }
  }, []);

  useEffect(() => {
    loadAttributes();
  }, [loadAttributes]);

  const handleOpenChange = (val: boolean) => {
    setOpen(val);
    if (!val) {
      setIsColorEditMode(false);
      setIsSizeEditMode(false);
      setIsCustomizingColor(false);
      setDuplicateError(null);
      resetForm();
    }
  };

  useEffect(() => {
    if (isColorEditMode) {
      setIsCustomizingColor(false);
    }
  }, [isColorEditMode]);

  useEffect(() => {
    if (isSizeEditMode) {
      setGenSizes([]);
    }
  }, [isSizeEditMode]);

  // --- ORDENAMIENTO ---
  const clothingSizes = useMemo(
    () =>
      sortSizes(
        rawSizes.filter((s) => s.type === "clothing").map((s) => s.name),
      ),
    [rawSizes],
  );

  const shoeSizes = useMemo(
    () =>
      sortSizes(rawSizes.filter((s) => s.type === "shoe").map((s) => s.name)),
    [rawSizes],
  );

  const sortedColors = useMemo(() => {
    return [...rawColors].sort((a, b) => a.name.localeCompare(b.name));
  }, [rawColors]);

  // --- LÓGICA DE COLORES (Toggle & Custom) ---
  const handlePresetChange = (name: string) => {
    if (selectedPresetColor === name) {
      setSelectedPresetColor("custom");
      setGenColorName("");
      setGenColorHex("#000000");
      setIsCustomizingColor(false);
      return;
    }

    setSelectedPresetColor(name);
    setIsCustomizingColor(false);

    if (name !== "custom") {
      const preset = rawColors.find((c) => c.name === name);
      if (preset) {
        setGenColorName(preset.name);
        setGenColorHex(preset.hex);
      }
    }
  };

  const handleUserHexChange = (val: string) => {
    setGenColorHex(val);
    setSelectedPresetColor("custom");
    setIsCustomizingColor(true);
  };

  const handleUserNameChange = (val: string) => {
    setGenColorName(val);
    if (duplicateError) setDuplicateError(null);
    if (selectedPresetColor !== "custom") setSelectedPresetColor("custom");
    setIsCustomizingColor(true);
  };

  // Añadir color
  const addCustomColor = async (name: string, hex: string) => {
    const cleanName = name.trim();
    if (!cleanName) return;

    // 1. VALIDACIÓN HEX
    if (!HEX_REGEX.test(hex)) {
      toast.error("Código de color inválido");
      return;
    }

    const finalName = capitalize(name.trim());
    if (!finalName) return;

    // 2. BUSCAR DUPLICADO POR NOMBRE
    const existingColor = rawColors.find(
      (c) => c.name.toLowerCase() === cleanName.toLowerCase(),
    );

    if (existingColor) {
      toast.error(`El color "${existingColor.name}" ya existe.`);
      setDuplicateError(existingColor.name);

      return;
    }

    const res = await createPresetColor(finalName, hex);
    if (res.success && res.color) {
      setRawColors((prev) => [...prev, res.color as PresetColor]);
      toast.success(`Color ${finalName} guardado.`);
      setSelectedPresetColor(finalName);
      setIsCustomizingColor(false);
      setDuplicateError(null);
    } else {
      toast.error("Error al guardar color");
    }
  };

  // --- LÓGICA DE TALLAS ---
  const addCustomSize = async () => {
    const val = customSizeInput.trim().toUpperCase();
    if (!val) return;

    if (genSizes.includes(val)) {
      toast.info("Esa talla ya está seleccionada");
      return;
    }

    const isNumber = !isNaN(Number(val.replace(",", ".")));
    const type = isNumber ? "shoe" : "clothing";

    setGenSizes((prev) => [...prev, val]);
    setCustomSizeInput("");

    const existsInDb = rawSizes.some((s) => s.name === val);
    if (!existsInDb) {
      const res = await createPresetSize(val, type);
      if (res.success && res.size) {
        setRawSizes((prev) => [...prev, res.size as PresetSize]);
        toast.success(`Talla ${val} guardada.`);
      }
    }
  };

  const removeAttribute = async (
    type: "size" | "color",
    id: string,
    name: string,
  ) => {
    if (type === "size") {
      const res = await deletePresetSize(id, name);
      if (res.error) return toast.error(res.error);

      setRawSizes((prev) => prev.filter((s) => s.id !== id));
      setGenSizes((prev) => prev.filter((s) => s !== name));
      toast.success("Talla eliminada.");
    } else {
      const res = await deletePresetColor(id, name);
      if (res.error) return toast.error(res.error);

      setRawColors((prev) => prev.filter((c) => c.id !== id));
      toast.success("Color eliminado.");
    }
  };

  // --- GENERACIÓN ---
  const handleGenerateClick = async () => {
    if (!genColorName.trim()) return toast.error("Elige un color.");
    if (genSizes.length === 0) return toast.error("Elige al menos una talla.");

    const finalName = capitalize(genColorName);

    const newVars = generateVariants(
      genSizes,
      [{ name: finalName, hex: genColorHex }],
      genStock,
    );

    onGenerate(newVars);
    setOpen(false);
  };

  const toggleSize = (s: string) => {
    setGenSizes((prev) =>
      prev.includes(s) ? prev.filter((x) => x !== s) : [...prev, s],
    );
  };

  const resetForm = () => {
    setGenSizes([]);
    setCustomSizeInput("");
    setGenColorName("");
    setGenColorHex("#000000");
    setSelectedPresetColor("custom");
    setIsCustomizingColor(false);
  };

  return {
    // UI States
    open,
    isLoadingAttributes,
    isColorEditMode,
    isSizeEditMode,
    isCustomizingColor,

    // Data
    dbSizes: rawSizes,
    dbColors: sortedColors,
    clothingSizes,
    shoeSizes,

    // Form Values
    selectedPresetColor,
    genSizes,
    genColorName,
    genColorHex,
    genStock,
    customSizeInput,

    // Errors
    duplicateError,

    // Actions & Setters
    handleOpenChange,
    setIsColorEditMode,
    setIsSizeEditMode,
    setGenStock,
    setCustomSizeInput,
    setGenColorName,

    // Handlers Lógicos
    handlePresetChange,
    handleUserHexChange,
    handleUserNameChange,
    addCustomColor,
    handleGenerateClick,
    toggleSize,
    addCustomSize,
    removeAttribute,
  };
}
