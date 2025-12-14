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

import { quickCreateCategory } from "@/app/(admin)/admin/categories/actions";

import type { ProductFormValues } from "@/lib/validation/product";

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

  // Estado local para la creación de categorías (UI)
  const [categories, setCategories] = useState(initialCats);
  const [isCreatingCat, setIsCreatingCat] = useState(false);
  const [newCatName, setNewCatName] = useState("");

  const selectedCatId = watch("categoryId");

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
      <div className="space-y-2">
        <Label>Nombre del Producto</Label>
        <Input {...register("name")} placeholder="Ej: Camiseta Oversize" />
        {errors.name && (
          <p className="text-red-500 text-xs">{errors.name.message}</p>
        )}
      </div>

      {/* PRECIO */}
      <div className="space-y-2">
        <Label>Precio (Céntimos)</Label>
        <div className="relative">
          <span className="absolute left-3 top-2.5 text-gray-500">€</span>
          <Input type="number" {...register("priceCents")} className="pl-7" />
        </div>
        <p className="text-xs text-muted-foreground">Ej: 2500 = 25.00€</p>
        {errors.priceCents && (
          <p className="text-red-500 text-xs">{errors.priceCents.message}</p>
        )}
      </div>

      {/* CATEGORÍA (Con creación rápida) */}
      <div className="space-y-2 col-span-2 md:col-span-1">
        <div className="flex justify-between">
          <Label>Categoría</Label>
          {!isCreatingCat && (
            <button
              type="button"
              onClick={() => setIsCreatingCat(true)}
              className="text-xs text-blue-600 hover:underline flex gap-1 items-center"
            >
              <FaPlus className="h-3 w-3" /> Nueva
            </button>
          )}
        </div>

        {isCreatingCat ? (
          <div className="flex gap-2">
            <Input
              value={newCatName}
              onChange={(e) => setNewCatName(e.target.value)}
              placeholder="Nombre..."
              className="h-9 text-sm"
            />
            <Button type="button" size="sm" onClick={handleQuickCreateCat}>
              <FaCheck />
            </Button>
            <Button
              type="button"
              size="sm"
              variant="ghost"
              onClick={() => setIsCreatingCat(false)}
            >
              <FaXmark />
            </Button>
          </div>
        ) : (
          <Select
            onValueChange={(val) => setValue("categoryId", val)}
            value={selectedCatId}
          >
            <SelectTrigger>
              <SelectValue placeholder="Selecciona..." />
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
        <input type="hidden" {...register("categoryId")} />
        {errors.categoryId && (
          <p className="text-red-500 text-xs">{errors.categoryId.message}</p>
        )}
      </div>

      {/* DESCRIPCIÓN */}
      <div className="col-span-2 space-y-2">
        <Label>Descripción</Label>
        <textarea
          {...register("description")}
          className="flex min-h-[100px] w-full rounded-md border border-input bg-background px-3 py-2 text-sm ring-offset-background placeholder:text-muted-foreground focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 disabled:cursor-not-allowed disabled:opacity-50"
        />
      </div>
    </div>
  );
}
