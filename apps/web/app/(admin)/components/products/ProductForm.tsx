"use client";

import { useState, useEffect, useMemo, useActionState } from "react";
import { FaPlus, FaTrash, FaImage, FaWandMagicSparkles } from "react-icons/fa6";
import { toast } from "sonner";

import {
  Button,
  Dialog,
  DialogContent,
  Input,
  Label,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";

import { CLOTHING_SIZES, SHOE_SIZES, PRODUCT_COLORS } from "@/lib/constants";

import {
  createProductAction,
  updateProductAction,
  type ProductFormState,
} from "@/app/(admin)/admin/products/actions";
import { DeleteProductDialog } from "@/app/(admin)/components/products/DeleteProductDialog";

import type { ProductVariant } from "@/types/catalog";

type Category = { id: string; name: string };
type FormVariant = Omit<ProductVariant, "id"> & {
  id?: string;
  colorHex?: string | null;
};
type FormImage = { url: string; color: string | null };

type Props = {
  categories: Category[];
  product?: {
    id: string;
    name: string;
    slug: string;
    description: string;
    priceCents: number;
    categoryId: string;
    images: FormImage[];
    variants: ProductVariant[];
  };
};

const INITIAL_STATE: ProductFormState = {};

export function ProductForm({ categories, product }: Props) {
  const isEditing = !!product;
  const action = isEditing
    ? updateProductAction.bind(null, product.id)
    : createProductAction;
  const [state, formAction, isPending] = useActionState(action, INITIAL_STATE);

  // --- ESTADOS ---
  const [variants, setVariants] = useState<FormVariant[]>(
    product?.variants || [{ size: "", color: "", colorHex: null, stock: 0 }],
  );

  const [images, setImages] = useState<FormImage[]>(
    product?.images || [{ url: "", color: null }],
  );

  const availableColors = useMemo(() => {
    const colors = new Set(variants.map((v) => v.color).filter(Boolean));
    return Array.from(colors);
  }, [variants]);

  useEffect(() => {
    if (state.message) toast.error(state.message);
    if (state.errors) {
      const allErrors = Object.values(state.errors).flatMap(
        (errs) => errs || [],
      );
      if (typeof allErrors[0] === "string") toast.error(allErrors[0]);
    }
  }, [state]);

  // --- HANDLERS VARIANTES ---
  const addVariant = () =>
    setVariants([...variants, { size: "", color: "", stock: 0 }]);
  const removeVariant = (idx: number) =>
    setVariants(variants.filter((_, i) => i !== idx));

  const updateVariant = (idx: number, field: keyof FormVariant, value: any) => {
    const next = [...variants];
    // Si cambia el color y es uno predefinido, buscamos su hex automáticamente
    if (field === "color") {
      const predefined = PRODUCT_COLORS.find((c) => c.name === value);
      if (predefined) {
        next[idx].colorHex = predefined.hex;
      }
    }
    next[idx] = { ...next[idx], [field]: value };
    setVariants(next);
  };

  // --- HANDLERS IMÁGENES ---
  const addImage = () => setImages([...images, { url: "", color: null }]);
  const removeImage = (idx: number) =>
    setImages(images.filter((_, i) => i !== idx));
  const updateImage = (idx: number, field: keyof FormImage, value: any) => {
    const next = [...images];
    next[idx] = { ...next[idx], [field]: value };
    setImages(next);
  };

  // Renderizador de fila de variante inteligente
  const renderVariantRow = (v: FormVariant, idx: number) => {
    // ¿Es un color predefinido?
    const isPredefinedColor = PRODUCT_COLORS.some((c) => c.name === v.color);
    // ¿Es una talla predefinida?
    const isPredefinedSize = [...CLOTHING_SIZES, ...SHOE_SIZES].includes(
      v.size,
    );

    return (
      <div
        key={idx}
        className="grid grid-cols-12 gap-2 items-start p-3 bg-neutral-50 rounded-md border"
      >
        {/* TALLA */}
        <div className="col-span-3">
          {/* Si es predefinida o está vacía, mostramos select. Si el usuario escribe algo raro, input. */}
          <div className="flex gap-1">
            <Input
              value={v.size}
              onChange={(e) => updateVariant(idx, "size", e.target.value)}
              placeholder="Talla"
              required
              className="h-9"
              list={`sizes-${idx}`} // Usamos datalist para sugerencias + texto libre
            />
            <datalist id={`sizes-${idx}`}>
              {[...CLOTHING_SIZES, ...SHOE_SIZES].map((s) => (
                <option key={s} value={s} />
              ))}
            </datalist>
          </div>
        </div>

        {/* COLOR (Con Picker) */}
        <div className="col-span-5 flex gap-2">
          <div className="flex-1">
            <Input
              value={v.color}
              onChange={(e) => updateVariant(idx, "color", e.target.value)}
              placeholder="Color"
              required
              className="h-9"
              list={`colors-${idx}`}
            />
            <datalist id={`colors-${idx}`}>
              {PRODUCT_COLORS.map((c) => (
                <option key={c.name} value={c.name} />
              ))}
            </datalist>
          </div>

          {/* Selector visual de color (Hex) */}
          <div className="shrink-0">
            <div className="relative w-9 h-9 rounded border overflow-hidden">
              <input
                type="color"
                className="absolute -top-2 -left-2 w-16 h-16 cursor-pointer p-0 border-0"
                value={v.colorHex || "#000000"}
                onChange={(e) => updateVariant(idx, "colorHex", e.target.value)}
                title="Elige el color visual"
              />
            </div>
          </div>
        </div>

        {/* STOCK */}
        <div className="col-span-3">
          <Input
            type="number"
            value={v.stock}
            onChange={(e) => updateVariant(idx, "stock", e.target.value)}
            min={0}
            className="h-9"
            required
          />
        </div>

        <div className="col-span-1 flex justify-center">
          <Button
            type="button"
            variant="ghost"
            size="icon"
            onClick={() => removeVariant(idx)}
            className="h-9 w-9 text-red-500 hover:bg-red-100"
          >
            <FaTrash className="h-4 w-4" />
          </Button>
        </div>
      </div>
    );
  };

  return (
    <div className="max-w-5xl mx-auto">
      <form
        action={formAction}
        className="space-y-8"
        onSubmit={(e) => {
          const invalidVariants = variants.some(
            (v) => !v.size.trim() || !v.color.trim(),
          );
          if (invalidVariants) {
            e.preventDefault();
            toast.error("Faltan datos en las variantes.");
          }
        }}
      >
        {/* ... (SECCIÓN 1: DATOS GENERALES - IGUAL QUE ANTES) ... */}
        {/* Copia tu bloque de "Información General" aquí */}
        <div className="grid gap-6 md:grid-cols-2 bg-white p-6 rounded-lg border shadow-sm">
          <div className="col-span-2">
            <h3 className="text-lg font-medium mb-4">Información General</h3>
          </div>
          <div className="space-y-2">
            <Label>Nombre</Label>
            <Input name="name" defaultValue={product?.name} required />
          </div>
          <div className="space-y-2">
            <Label>Slug</Label>
            <Input
              name="slug"
              defaultValue={product?.slug}
              placeholder="auto-generado"
            />
          </div>
          <div className="space-y-2">
            <Label>Precio (Céntimos)</Label>
            <Input
              name="priceCents"
              type="number"
              defaultValue={product?.priceCents}
              required
            />
          </div>
          <div className="space-y-2">
            <Label>Categoría</Label>
            <Select name="categoryId" defaultValue={product?.categoryId}>
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
          </div>
          <div className="col-span-2 space-y-2">
            <Label>Descripción</Label>
            <textarea
              name="description"
              defaultValue={product?.description}
              className="flex min-h-[100px] w-full rounded-md border border-input bg-background px-3 py-2 text-sm"
              required
            />
          </div>
        </div>

        {/* 2. VARIANTES */}
        <div className="bg-white p-6 rounded-lg border shadow-sm">
          <div className="flex justify-between items-center mb-4">
            <h3 className="text-lg font-medium">Inventario</h3>
            {/* Puedes mantener el generador rápido aquí si quieres, o quitarlo para simplificar */}
            <Button
              type="button"
              variant="outline"
              size="sm"
              onClick={addVariant}
            >
              <FaPlus className="mr-2" /> Nueva Fila
            </Button>
          </div>

          <div className="space-y-2">
            <div className="grid grid-cols-12 gap-2 text-xs font-medium text-muted-foreground px-2 pb-2">
              <div className="col-span-3">TALLA</div>
              <div className="col-span-5">COLOR (Nombre + Visual)</div>
              <div className="col-span-3">STOCK</div>
              <div className="col-span-1"></div>
            </div>

            {variants.length === 0 && (
              <p className="text-center text-sm text-muted-foreground py-4">
                Sin variantes.
              </p>
            )}

            {variants.map((v, idx) => renderVariantRow(v, idx))}
          </div>
          <input
            type="hidden"
            name="variantsJson"
            value={JSON.stringify(variants)}
          />
        </div>

        {/* 3. IMÁGENES */}
        <div className="bg-white p-6 rounded-lg border shadow-sm">
          <div className="flex justify-between items-center mb-4">
            <h3 className="text-lg font-medium">Imágenes</h3>
            <Button
              type="button"
              variant="outline"
              size="sm"
              onClick={addImage}
            >
              <FaPlus className="mr-2" /> URL
            </Button>
          </div>

          <div className="space-y-3">
            {images.map((img, idx) => (
              <div
                key={idx}
                className="flex gap-3 items-center p-3 border rounded-md"
              >
                <Input
                  value={img.url}
                  onChange={(e) => updateImage(idx, "url", e.target.value)}
                  placeholder="https://..."
                  className="flex-1"
                  required
                />

                <div className="w-32">
                  <Select
                    value={img.color || "all"}
                    onValueChange={(val) =>
                      updateImage(idx, "color", val === "all" ? null : val)
                    }
                  >
                    <SelectTrigger className="h-9">
                      <SelectValue placeholder="Asignar" />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="all">Todos</SelectItem>
                      {availableColors.map((c) => (
                        <SelectItem key={c} value={c}>
                          {c}
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                </div>

                <div className="h-9 w-9 bg-neutral-100 rounded overflow-hidden border">
                  {img.url ? (
                    // eslint-disable-next-line @next/next/no-img-element
                    <img
                      src={img.url}
                      alt=""
                      className="h-full w-full object-cover"
                    />
                  ) : null}
                </div>
                <Button
                  type="button"
                  variant="ghost"
                  size="icon"
                  onClick={() => removeImage(idx)}
                >
                  <FaTrash className="text-red-500 h-4 w-4" />
                </Button>
              </div>
            ))}
          </div>
          <input
            type="hidden"
            name="imagesJson"
            value={JSON.stringify(images)}
          />
        </div>

        <div className="flex justify-end gap-4 pt-4">
          <Button
            type="button"
            variant="ghost"
            onClick={() => window.history.back()}
          >
            Cancelar
          </Button>
          <Button type="submit" disabled={isPending}>
            {isPending ? "Guardando..." : "Guardar Producto"}
          </Button>
        </div>
      </form>
      {isEditing && product && (
        <div className="mt-12 pt-8 border-t">
          <div className="flex items-center justify-between bg-red-50 border border-red-200 p-4 rounded-lg">
            <div>
              <p className="text-sm font-medium text-red-900">
                Eliminar este producto
              </p>
            </div>
            <DeleteProductDialog
              productId={product.id}
              productName={product.name}
            />
          </div>
        </div>
      )}
    </div>
  );
}
