"use client";
import { useState } from "react";
import {
  FaPalette,
  FaTags,
  FaWandMagicSparkles,
  FaPlus,
} from "react-icons/fa6";
import { ImSpinner8 } from "react-icons/im";

import { Button, Input, Label, Switch } from "@/components/ui";
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
} from "@/components/ui/alert-dialog";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogDescription,
  DialogFooter,
  DialogTrigger,
} from "@/components/ui/dialog";
import { Separator } from "@/components/ui/separator";

import { capitalize } from "@/lib/products/utils";
import { cn } from "@/lib/utils";

import { useVariantDialog } from "@/hooks/products/use-variant-dialog";

import { ColorChip, SizeChip } from "./VariantChips";

type Props = {
  onGenerate: (variants: any[]) => void;
};

type ItemToDelete = {
  type: "color" | "size";
  id: string;
  name: string;
} | null;

export function VariantGeneratorDialog({ onGenerate }: Props) {
  const [itemToDelete, setItemToDelete] = useState<ItemToDelete>(null);

  const {
    open,
    handleOpenChange,
    isLoadingAttributes,

    // Modos
    isColorEditMode,
    setIsColorEditMode,
    isSizeEditMode,
    setIsSizeEditMode,
    isCustomizingColor,

    // Datos
    dbSizes,
    dbColors,
    clothingSizes,
    shoeSizes,

    // Formulario
    selectedPresetColor,
    genSizes,
    genColorName,
    genColorHex,
    genStock,
    customSizeInput,

    // Acciones
    setGenStock,
    setCustomSizeInput,
    setGenColorName,
    handlePresetChange,
    handleUserHexChange,
    handleUserNameChange,
    addCustomColor,
    handleGenerateClick,
    toggleSize,
    addCustomSize,
    removeAttribute,
  } = useVariantDialog({ onGenerate });

  const showAddColorBtn =
    isCustomizingColor || selectedPresetColor === "custom";
  const colorSectionTitle = showAddColorBtn
    ? "Añade un color nuevo"
    : "Color Seleccionado";

  const confirmDelete = () => {
    if (!itemToDelete) return;

    removeAttribute(itemToDelete.type, itemToDelete.id, itemToDelete.name);

    setItemToDelete(null);
  };

  return (
    <>
      <Dialog open={open} onOpenChange={handleOpenChange}>
        <DialogTrigger asChild>
          <Button type="button">
            <FaWandMagicSparkles className="size-3.5 mr-2" />
            Generar Variantes
          </Button>
        </DialogTrigger>

        <DialogContent className="max-w-xl max-h-[90vh] overflow-y-auto">
          <DialogHeader>
            <DialogTitle>Generador de Variantes</DialogTitle>
            <DialogDescription>
              Elige el color y las tallas para generar las variantes
            </DialogDescription>
          </DialogHeader>

          {isLoadingAttributes ? (
            <div className="py-10 flex justify-center">
              <ImSpinner8 className="animate-spin size-6 text-neutral-400" />
            </div>
          ) : (
            <div className="space-y-6 py-4">
              {/* --- SECCIÓN COLORES --- */}
              <div className="space-y-2">
                <div className="flex items-center justify-between">
                  <Label className="flex items-center gap-2">
                    <FaPalette className="size-3.5" /> Colores
                  </Label>
                  <div className="flex items-center gap-2 scale-90 origin-right">
                    <Label
                      htmlFor="color-edit"
                      className={cn(
                        "text-xs font-medium transition-colors",
                        isColorEditMode ? "text-red-600" : "text-foreground",
                      )}
                    >
                      Editar (Borrar)
                    </Label>
                    <Switch
                      id="color-edit"
                      checked={isColorEditMode}
                      onCheckedChange={setIsColorEditMode}
                      className="data-[state=checked]:bg-red-500 cursor-pointer"
                    />
                  </div>
                </div>

                <div className="bg-neutral-50 p-4 rounded-xs border space-y-4">
                  <div className="flex flex-wrap gap-2">
                    {dbColors.length > 0 ? (
                      dbColors.map((c) => (
                        <ColorChip
                          key={c.id}
                          id={c.id}
                          name={c.name}
                          hex={c.hex}
                          isSelected={selectedPresetColor === c.name}
                          isEditMode={isColorEditMode}
                          onToggle={handlePresetChange}
                          onDelete={(id, name) =>
                            setItemToDelete({ type: "color", id, name })
                          }
                        />
                      ))
                    ) : (
                      <p className="text-xs text-neutral-400 italic py-2">
                        No hay colores guardados.
                      </p>
                    )}
                  </div>

                  <div
                    className={cn(
                      "transition-all duration-200",
                      isColorEditMode &&
                        "opacity-50 pointer-events-none grayscale",
                    )}
                  >
                    <Separator className="bg-neutral-200/60 mb-4" />

                    <div>
                      <span className="text-xs font-medium text-slate-700 uppercase mb-1 block transition-all">
                        {colorSectionTitle}
                      </span>
                      <div className="flex gap-2 items-center">
                        <div
                          className="relative w-10 h-9 overflow-hidden rounded-xs border shadow-sm shrink-0 cursor-pointer hover:border-neutral-400 transition-colors"
                          style={{ background: genColorHex }}
                          title="Click para cambiar hex"
                        >
                          <input
                            type="color"
                            className="absolute inset-y-[-50%] inset-x-[-50%] w-[200%] h-[200%] cursor-pointer p-0 border-0 opacity-0"
                            value={genColorHex}
                            onChange={(e) =>
                              handleUserHexChange(e.target.value)
                            }
                          />
                        </div>
                        <Input
                          className="h-9 bg-white"
                          placeholder="Nombre (ej: Verde Menta)"
                          value={genColorName}
                          onChange={(e) => handleUserNameChange(e.target.value)}
                          onBlur={() =>
                            setGenColorName(capitalize(genColorName))
                          }
                        />

                        <Button
                          className={cn(
                            "",
                            !genColorName && "pointer-events-none opacity-50",
                          )}
                          type="button"
                          variant="outline"
                          onClick={() =>
                            addCustomColor(genColorName, genColorHex)
                          }
                          title="Guardar como nuevo color"
                        >
                          <FaPlus className="size-4 text-slate-500" />
                        </Button>
                      </div>
                    </div>
                  </div>
                </div>
              </div>

              {/* --- SECCIÓN TALLAS --- */}
              <div className="space-y-2">
                <div className="flex items-center justify-between">
                  <Label className="flex items-center gap-2">
                    <FaTags className="size-3.5" /> Tallas
                  </Label>
                  <div className="flex items-center gap-2 scale-90 origin-right">
                    <Label
                      htmlFor="size-edit"
                      className={cn(
                        "text-xs font-medium transition-colors",
                        isSizeEditMode ? "text-red-600" : "text-foreground",
                      )}
                    >
                      Editar (Borrar)
                    </Label>
                    <Switch
                      id="size-edit"
                      checked={isSizeEditMode}
                      onCheckedChange={setIsSizeEditMode}
                      className="data-[state=checked]:bg-red-500 cursor-pointer"
                    />
                  </div>
                </div>

                <div className="border p-4 rounded-xs space-y-4">
                  {/* Ropa */}
                  <div>
                    <span className="text-xs font-medium text-slate-700 uppercase mb-2 block">
                      Ropa
                    </span>
                    <div className="flex flex-wrap gap-2">
                      {clothingSizes.length > 0 ? (
                        clothingSizes.map((s) => {
                          const dbEntry = dbSizes.find((d) => d.name === s);
                          return (
                            <SizeChip
                              key={s}
                              name={s}
                              dbId={dbEntry?.id}
                              isSelected={genSizes.includes(s)}
                              isEditMode={isSizeEditMode}
                              onToggle={toggleSize}
                              onDelete={(id, name) =>
                                setItemToDelete({ type: "size", id, name })
                              }
                            />
                          );
                        })
                      ) : (
                        <span className="text-xs text-neutral-400 italic">
                          No hay tallas guardadas.
                        </span>
                      )}
                    </div>
                  </div>

                  <Separator />

                  {/* Calzado */}
                  <div>
                    <span className="text-xs font-medium text-slate-700 uppercase mb-2 block">
                      Calzado
                    </span>
                    <div className="flex flex-wrap gap-2">
                      {shoeSizes.length > 0 ? (
                        shoeSizes.map((s) => {
                          const dbEntry = dbSizes.find((d) => d.name === s);
                          return (
                            <SizeChip
                              key={s}
                              name={s}
                              dbId={dbEntry?.id}
                              isSelected={genSizes.includes(s)}
                              isEditMode={isSizeEditMode}
                              onToggle={toggleSize}
                              onDelete={(id, name) =>
                                setItemToDelete({ type: "size", id, name })
                              }
                            />
                          );
                        })
                      ) : (
                        <span className="text-xs text-neutral-400 italic">
                          No hay tallas guardadas.
                        </span>
                      )}
                    </div>
                  </div>

                  <Separator />

                  {/* INPUT TALLAS (Desactivado visualmente en modo edición) */}
                  <div
                    className={cn(
                      "transition-all duration-200",
                      isSizeEditMode &&
                        "opacity-50 pointer-events-none grayscale",
                    )}
                  >
                    <span className="text-xs font-medium text-slate-700 uppercase mb-1 block">
                      Añade una nueva talla
                    </span>
                    <div className="flex gap-2">
                      <Input
                        placeholder="Ej: 6XL, 100ml..."
                        className="h-9 uppercase"
                        value={customSizeInput}
                        onChange={(e) => setCustomSizeInput(e.target.value)}
                        onKeyDown={(e) => {
                          if (e.key === "Enter") {
                            e.preventDefault();
                            addCustomSize();
                          }
                        }}
                      />
                      <Button
                        className={cn(
                          !customSizeInput && "pointer-events-none opacity-50",
                        )}
                        type="button"
                        variant="outline"
                        onClick={addCustomSize}
                      >
                        <FaPlus className="size-4 text-slate-500" />
                      </Button>
                    </div>
                  </div>
                </div>
              </div>

              {/* --- STOCK --- */}
              <div
                className={cn(
                  "space-y-2 transition-opacity duration-200",
                  (isColorEditMode || isSizeEditMode) &&
                    "opacity-50 pointer-events-none grayscale",
                )}
              >
                <Label>Stock Inicial (para cada variante)</Label>
                <Input
                  type="number"
                  min="0"
                  value={genStock}
                  onChange={(e) => setGenStock(Number(e.target.value))}
                />
              </div>
            </div>
          )}

          <DialogFooter>
            <Button variant="outline" onClick={() => handleOpenChange(false)}>
              Cerrar
            </Button>
            <Button
              disabled={isColorEditMode || isSizeEditMode}
              className={cn(
                "space-y-2 transition-opacity duration-200",
                (isColorEditMode || isSizeEditMode) &&
                  "opacity-50 pointer-events-none",
              )}
              onClick={handleGenerateClick}
            >
              Generar Variantes
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
      <AlertDialog
        open={!!itemToDelete}
        onOpenChange={(val) => !val && setItemToDelete(null)}
      >
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>¿Estás completamente seguro?</AlertDialogTitle>
            <AlertDialogDescription>
              Vas a eliminar{" "}
              {itemToDelete?.type === "color" ? "el color" : "la talla"}{" "}
              <span className="font-bold text-foreground">
                "{itemToDelete?.name}"
              </span>{" "}
              de la base de datos global.
              <br />
              <br />
              Esta acción no se puede deshacer y desaparecerá de las opciones
              futuras.
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel>Cancelar</AlertDialogCancel>
            <AlertDialogAction
              onClick={confirmDelete}
              className="bg-red-600 hover:bg-red-700 text-white"
            >
              Sí, eliminar
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    </>
  );
}
