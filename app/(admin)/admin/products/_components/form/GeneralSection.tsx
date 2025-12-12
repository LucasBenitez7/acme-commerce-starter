import { useRouter } from "next/navigation";
import { useState, useRef, useEffect } from "react";
import { FaPlus, FaCheck, FaChevronDown, FaXmark } from "react-icons/fa6";
import { toast } from "sonner";

import { Button, Input, Label } from "@/components/ui";
import {
  Collapsible,
  CollapsibleContent,
  CollapsibleTrigger,
} from "@/components/ui/collapsible";

import { cn } from "@/lib/utils";

import { quickCreateCategory } from "@/app/(admin)/admin/categories/actions";

import type { Category } from "./types";

type Props = {
  defaultValues?: {
    name?: string;
    slug?: string;
    priceCents?: number;
    categoryId?: string;
    description?: string;
  };
  categories: Category[];
  errors?: Record<string, string[] | undefined>;
};

export function GeneralSection({
  defaultValues,
  categories: initialCategories,
  errors,
}: Props) {
  const router = useRouter();

  const [categoriesList, setCategoriesList] =
    useState<Category[]>(initialCategories);
  // Estados para Categoría
  useEffect(() => {
    setCategoriesList(initialCategories);
  }, [initialCategories]);

  const [selectedCat, setSelectedCat] = useState(
    defaultValues?.categoryId || "",
  );
  const [isCatOpen, setIsCatOpen] = useState(true);
  const [isCreatingCat, setIsCreatingCat] = useState(false);
  const [newCatName, setNewCatName] = useState("");
  const [isSavingCat, setIsSavingCat] = useState(false);

  const textAreaRef = useRef<HTMLTextAreaElement>(null);

  const adjustHeight = () => {
    const el = textAreaRef.current;
    if (el) {
      el.style.height = "auto";
      el.style.height = el.scrollHeight + "px";
    }
  };

  useEffect(() => {
    adjustHeight();
  }, [defaultValues?.description]);

  // Manejador de creación rápida
  const handleQuickCreateCat = async () => {
    if (!newCatName.trim()) {
      toast.error("Escribe un nombre para la categoría");
      return;
    }
    setIsSavingCat(true);

    const res = await quickCreateCategory(newCatName);

    if (res.error) {
      toast.error(res.error);
    } else if (res.category) {
      toast.success(`Categoría "${res.category.name}" creada`);
      setCategoriesList((prev) =>
        [...prev, res.category].sort((a, b) => a.name.localeCompare(b.name)),
      );
      setSelectedCat(res.category.id);
      setNewCatName("");
      setIsCreatingCat(false);
      router.refresh();
    }
    setIsSavingCat(false);
  };

  return (
    <div className="grid gap-6 md:grid-cols-2 bg-white p-6 rounded-xs border shadow-sm animate-in fade-in">
      <div className="col-span-2">
        <h3 className="text-lg font-medium mb-4">Información General</h3>
      </div>

      {/* NOMBRE */}
      <div className="space-y-2">
        <Label htmlFor="name">Nombre del Producto</Label>
        <Input
          id="name"
          name="name"
          defaultValue={defaultValues?.name}
          placeholder="Ej: Camiseta Oversize"
          required
        />
        {errors?.name && (
          <p className="text-red-500 text-xs">{errors.name[0]}</p>
        )}
      </div>

      {/* PRECIO */}
      <div className="space-y-2">
        <Label htmlFor="priceCents">Precio (Céntimos)</Label>
        <div className="relative">
          <span className="absolute left-3 top-2.5 text-gray-500">€</span>
          <Input
            id="priceCents"
            name="priceCents"
            type="number"
            className="pl-7"
            defaultValue={defaultValues?.priceCents}
            placeholder="2500"
            required
          />
        </div>
        <p className="text-xs text-muted-foreground">Ej: 2500 = 25,00€</p>
      </div>

      {/* CATEGORÍA */}
      <div className="space-y-2 col-span-2 md:col-span-1">
        <div className="flex items-center justify-between">
          <Label>Categoría</Label>
          {!isCreatingCat && (
            <button
              type="button"
              onClick={(e) => {
                e.preventDefault();
                setIsCreatingCat(true);
              }}
              className="text-xs text-blue-600 hover:underline flex items-center gap-1 font-medium"
            >
              <FaPlus className="h-3 w-3" /> Nueva Categoría
            </button>
          )}
        </div>

        {/* --- FORMULARIO DE CREACIÓN RÁPIDA VISIBLE --- */}
        {isCreatingCat && (
          <div className="flex gap-2 mb-3 animate-in slide-in-from-top-2 p-3 bg-blue-50/50 rounded-xs border border-blue-100 items-center">
            <Input
              value={newCatName}
              onChange={(e) => setNewCatName(e.target.value)}
              placeholder="Nombre nueva categoría..."
              className="h-9 text-sm bg-white flex-1"
              autoFocus
              // Mantenemos el Enter por comodidad, pero ya no es obligatorio
              onKeyDown={(e) => {
                if (e.key === "Enter") {
                  e.preventDefault();
                  e.stopPropagation();
                  handleQuickCreateCat();
                }
              }}
            />

            {/* BOTÓN GUARDAR EXPLÍCITO */}
            <Button
              type="button"
              size="sm"
              onClick={(e) => {
                e.preventDefault();
                handleQuickCreateCat();
              }}
              disabled={isSavingCat}
              className="h-9 px-4 bg-blue-600 hover:bg-blue-700 text-white shadow-sm"
            >
              {isSavingCat ? "..." : "Guardar"}
            </Button>

            {/* Botón Cancelar */}
            <Button
              type="button"
              size="sm"
              variant="ghost"
              onClick={(e) => {
                e.preventDefault();
                setIsCreatingCat(false);
              }}
              className="h-9 w-9 p-0 hover:bg-red-50 hover:text-red-500"
              title="Cancelar"
            >
              <FaXmark />
            </Button>
          </div>
        )}

        <input type="hidden" name="categoryId" value={selectedCat} />

        <Collapsible
          open={isCatOpen}
          onOpenChange={setIsCatOpen}
          className="border rounded-xs p-3 bg-neutral-50/30"
        >
          <div className="flex items-center justify-between mb-2">
            <span className="text-xs font-medium text-muted-foreground">
              {/* Usamos la lista local actualizada para buscar el nombre */}
              {selectedCat
                ? categoriesList.find((c) => c.id === selectedCat)?.name
                : "Selecciona una..."}
            </span>
            <CollapsibleTrigger asChild>
              <Button
                type="button"
                variant="ghost"
                size="sm"
                className="h-6 w-6 p-0"
              >
                <FaChevronDown
                  className={cn(
                    "h-3 w-3 transition-transform",
                    isCatOpen && "rotate-180",
                  )}
                />
              </Button>
            </CollapsibleTrigger>
          </div>

          <CollapsibleContent>
            {/* Usamos categoriesList (estado local) en lugar de props directas para ver cambios al instante */}
            <div className="grid grid-cols-2 sm:grid-cols-3 gap-2 pt-2 max-h-[200px] overflow-y-auto pr-1">
              {categoriesList.map((cat) => {
                const isSelected = selectedCat === cat.id;
                return (
                  <div
                    key={cat.id}
                    onClick={() => setSelectedCat(cat.id)}
                    className={cn(
                      "cursor-pointer flex items-center gap-2 p-2 rounded border text-xs transition-all select-none group",
                      isSelected
                        ? "bg-white border-black ring-1 ring-black shadow-sm z-10"
                        : "bg-white border-neutral-200 hover:border-blue-400",
                    )}
                  >
                    <div
                      className={cn(
                        "h-3.5 w-3.5 rounded-full border flex items-center justify-center shrink-0 transition-colors",
                        isSelected
                          ? "border-black bg-black"
                          : "border-neutral-300 group-hover:border-blue-400",
                      )}
                    >
                      {isSelected && (
                        <div className="h-1.5 w-1.5 rounded-full bg-white" />
                      )}
                    </div>
                    <span
                      className={cn("truncate", isSelected && "font-medium")}
                    >
                      {cat.name}
                    </span>
                  </div>
                );
              })}
              {categoriesList.length === 0 && (
                <p className="col-span-full text-center text-xs text-muted-foreground py-2">
                  No hay categorías. ¡Crea una!
                </p>
              )}
            </div>
          </CollapsibleContent>
        </Collapsible>

        {errors?.categoryId && (
          <p className="text-red-500 text-xs mt-1">{errors.categoryId[0]}</p>
        )}
      </div>

      {/* DESCRIPCIÓN */}
      <div className="col-span-2 space-y-2">
        <Label htmlFor="description">Descripción</Label>
        <textarea
          ref={textAreaRef}
          id="description"
          name="description"
          defaultValue={defaultValues?.description}
          onChange={adjustHeight}
          className="flex min-h-[100px] w-full rounded-xs border border-input bg-background px-3 py-2 text-sm ring-offset-background placeholder:text-muted-foreground focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring resize-none overflow-hidden"
          required
        />
      </div>
    </div>
  );
}
