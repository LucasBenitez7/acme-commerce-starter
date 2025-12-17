"use client";

import { useState, useEffect } from "react";
import { useFormContext } from "react-hook-form";
import { FaPlus, FaCheck, FaXmark } from "react-icons/fa6";
import { toast } from "sonner";

import { Button, Input, Label } from "@/components/ui";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Textarea } from "@/components/ui/textarea";

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
    <div className="grid gap-6 md:grid-cols-2 bg-white p-6 rounded-lg border shadow-sm">
      <div className="col-span-2">
        <h3 className="text-lg font-medium">Información General</h3>
      </div>

      {/* NOMBRE */}
      <div className="space-y-2 col-span-2 md:col-span-1">
        <Label>Nombre del Producto</Label>
        <Input {...register("name")} placeholder="Ej: Camiseta Oversize" />
        {errors.name && (
          <p className="text-red-500 text-xs">{errors.name.message}</p>
        )}
      </div>

      {/* PRECIO INTELIGENTE */}
      <div className="space-y-2 col-span-2 md:col-span-1">
        <Label>Precio (Euros)</Label>
        <div className="relative">
          <span className="absolute left-3 top-2.5 text-neutral-500 font-medium">
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

      {/* CATEGORÍA */}
      <div className="space-y-2 col-span-2">
        <div className="flex justify-between items-end">
          <Label>Categoría</Label>
          {!isCreatingCat && (
            <button
              type="button"
              onClick={() => setIsCreatingCat(true)}
              className="text-xs text-blue-600 hover:text-blue-800 hover:underline flex gap-1 items-center transition-colors"
            >
              <FaPlus className="h-3 w-3" /> Nueva categoría
            </button>
          )}
        </div>

        {isCreatingCat ? (
          <div className="flex gap-2 items-center animate-in fade-in slide-in-from-left-2">
            <Input
              value={newCatName}
              onChange={(e) => setNewCatName(e.target.value)}
              placeholder="Nombre de la nueva categoría..."
              className="h-10"
              autoFocus
            />
            <Button type="button" size="icon" onClick={handleQuickCreateCat}>
              <FaCheck className="h-4 w-4" />
            </Button>
            <Button
              type="button"
              size="icon"
              variant="ghost"
              onClick={() => setIsCreatingCat(false)}
            >
              <FaXmark className="h-4 w-4" />
            </Button>
          </div>
        ) : (
          <Select
            onValueChange={(val) =>
              setValue("categoryId", val, { shouldValidate: true })
            }
            value={selectedCatId}
          >
            <SelectTrigger>
              <SelectValue placeholder="Selecciona una categoría..." />
            </SelectTrigger>
            <SelectContent>
              {categories.map((c) => (
                <SelectItem key={c.id} value={c.id}>
                  {c.name}
                </SelectItem>
              ))}
            </SelectContent>
          </Select>
        )}
        {errors.categoryId && (
          <p className="text-red-500 text-xs">{errors.categoryId.message}</p>
        )}
        <input type="hidden" {...register("categoryId")} />
      </div>

      {/* DESCRIPCIÓN */}
      <div className="col-span-2 space-y-2">
        <Label>Descripción</Label>
        <Textarea
          {...register("description")}
          placeholder="Detalles del producto, materiales, cuidados..."
          className="min-h-[120px]"
        />
      </div>
    </div>
  );
}
