"use client";

import { useState } from "react";
import { useFormContext } from "react-hook-form";
import { FaPlus, FaCheck, FaXmark, FaChevronRight } from "react-icons/fa6";
import { toast } from "sonner";

import { Button, Input, Label } from "@/components/ui";
import {
  Collapsible,
  CollapsibleContent,
  CollapsibleTrigger,
} from "@/components/ui/collapsible";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Textarea } from "@/components/ui/textarea";

import { cn } from "@/lib/utils";

import { quickCreateCategory } from "@/app/(admin)/admin/categories/actions";

import type { ProductFormValues } from "@/lib/products/schema";

type Props = {
  categories: { id: string; name: string }[];
};

export function GeneralSection({ categories: initialCats }: Props) {
  const {
    register,
    formState: { errors },
    setValue,
    watch,
  } = useFormContext<ProductFormValues>();

  const [categories, setCategories] = useState(initialCats);
  const [isCreatingCat, setIsCreatingCat] = useState(false);
  const [newCatName, setNewCatName] = useState("");

  const [isDescOpen, setIsDescOpen] = useState(false);

  const selectedCatId = watch("categoryId");
  const priceCentsValue = watch("priceCents");

  const [priceInEuros, setPriceInEuros] = useState(
    priceCentsValue ? (priceCentsValue / 100).toFixed(2) : "",
  );

  const handlePriceChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const val = e.target.value;
    setPriceInEuros(val);
    const cents = Math.round(parseFloat(val || "0") * 100);
    setValue("priceCents", cents, { shouldValidate: true });
  };

  const handleQuickCreateCat = async () => {
    if (!newCatName.trim()) return;
    const res = await quickCreateCategory(newCatName);
    if (res.category) {
      setCategories([...categories, res.category]);
      setValue("categoryId", res.category.id);
      setIsCreatingCat(false);
      setNewCatName("");
      toast.success("Categoría creada");
    } else {
      toast.error(res.error || "Error al crear");
    }
  };

  return (
    <div className="flex flex-col space-y-6 bg-white p-4 rounded-xs border shadow-sm ">
      <h3 className="text-lg font-medium border-b pb-2">Información General</h3>

      <div className="lg:flex space-y-4 lg:space-y-0 w-full inline-block gap-3">
        <div className="space-y-2 flex-1">
          <Label>Nombre del Producto</Label>
          <Input {...register("name")} placeholder="Ej: Camiseta Oversize" />
          {errors.name && (
            <p className="text-red-500 text-xs">{errors.name.message}</p>
          )}
        </div>

        <div className="space-y-2 w-[150px]">
          <Label>Precio (Euros)</Label>
          <div className="relative">
            <span className="absolute left-3 top-2 text-neutral-500 font-medium">
              €
            </span>
            <Input
              type="number"
              step="0.01"
              min="0"
              placeholder="0.00"
              value={priceInEuros}
              onChange={handlePriceChange}
              className="pl-8"
            />
            {/* Input oculto real que se registra en Zod */}
            <input type="hidden" {...register("priceCents")} />
          </div>
          {errors.priceCents && (
            <p className="text-red-500 text-xs">El precio es requerido</p>
          )}
        </div>
      </div>

      {/* CATEGORÍA */}
      <div className="space-y-2 col-span-2">
        <div className="flexitems-center">
          <Label>Categoría</Label>
        </div>

        <div className="flex items-center gap-2">
          {isCreatingCat ? (
            <div className="flex gap-2 items-center animate-in fade-in slide-in-from-left-2 w-full">
              <Input
                value={newCatName}
                onChange={(e) => setNewCatName(e.target.value)}
                placeholder="Nombre de la nueva categoría..."
                className="h-9 mr-1"
                autoFocus
              />

              <Button type="button" size="icon" onClick={handleQuickCreateCat}>
                <FaCheck className="size-4" />
              </Button>
              <Button
                type="button"
                size="icon"
                variant="outline"
                onClick={() => setIsCreatingCat(false)}
              >
                <FaXmark className="size-4" />
              </Button>
            </div>
          ) : (
            <Select
              onValueChange={(val) =>
                setValue("categoryId", val, { shouldValidate: true })
              }
              value={selectedCatId}
            >
              <SelectTrigger className="">
                <SelectValue placeholder="Selecciona una categoría..." />
              </SelectTrigger>
              <SelectContent align="start" className="min-w-[180px]">
                {categories.map((c) => (
                  <SelectItem key={c.id} value={c.id}>
                    {c.name}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          )}

          {!isCreatingCat && (
            <Button
              variant={"ghost"}
              type="button"
              onClick={() => setIsCreatingCat(true)}
              className="text-xs flex gap-1 items-center h-9"
            >
              <FaPlus className="size-3" /> Nueva categoría
            </Button>
          )}

          {errors.categoryId && (
            <p className="text-red-500 text-xs">{errors.categoryId.message}</p>
          )}

          <input type="hidden" {...register("categoryId")} />
        </div>
      </div>

      {/* DESCRIPCIÓN */}
      <div>
        <Collapsible
          open={isDescOpen}
          onOpenChange={setIsDescOpen}
          className={cn(
            "col-span-2 rounded-xs border border-transparent transition-all duration-200",
          )}
        >
          <div className="flex items-center justify-between">
            <CollapsibleTrigger asChild>
              <Button
                variant="ghost"
                type="button"
                className={cn(
                  "w-fit justify-between hover:bg-neutral-50 active:bg-neutral-50 font-medium px-0",
                )}
              >
                <span className="text-sm font-medium text-foreground">
                  Descripción
                </span>
                <FaChevronRight
                  className={cn(
                    "size-3.5 text-muted-foreground transition-transform duration-200",
                    isDescOpen && "rotate-90",
                  )}
                />
              </Button>
            </CollapsibleTrigger>
          </div>

          <CollapsibleContent className="overflow-hidden data-[state=closed]:animate-collapsible-up data-[state=open]:animate-collapsible-down">
            <div className="pt-1">
              <Textarea
                {...register("description")}
                placeholder="Detalles del producto, materiales, cuidados..."
                minRows={5}
                className="bg-white mb-2"
              />
            </div>
          </CollapsibleContent>
        </Collapsible>

        {errors.description && (
          <p className="text-red-500 text-xs">{errors.description.message}</p>
        )}
      </div>
    </div>
  );
}
