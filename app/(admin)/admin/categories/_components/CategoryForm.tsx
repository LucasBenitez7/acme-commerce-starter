"use client";

import Link from "next/link";
import { useEffect, useActionState } from "react";
import { toast } from "sonner";

import { Button, Input, Label } from "@/components/ui";

import {
  createCategoryAction,
  updateCategoryAction,
  type CategoryFormState,
} from "../actions";

type Props = {
  category?: {
    id: string;
    name: string;
    slug: string;
    sort: number;
  };
};

const INITIAL_STATE: CategoryFormState = {
  message: "",
  errors: {},
};

export function CategoryForm({ category }: Props) {
  const isEditing = !!category;

  const action = isEditing
    ? updateCategoryAction.bind(null, category.id)
    : createCategoryAction;

  const [state, formAction, isPending] = useActionState<
    CategoryFormState,
    FormData
  >(action, INITIAL_STATE);

  useEffect(() => {
    if (state.message) {
      toast.error(state.message);
    }
  }, [state]);

  return (
    <form action={formAction} className="space-y-6">
      <div className="grid gap-4 bg-white p-6 rounded-lg border shadow-sm">
        {/* NOMBRE */}
        <div className="space-y-2">
          <Label htmlFor="name">Nombre</Label>
          <Input
            id="name"
            name="name"
            defaultValue={category?.name}
            placeholder="Ej: Zapatillas"
            autoFocus={!isEditing}
          />
          {state.errors?.name && (
            <p className="text-red-500 text-xs">{state.errors.name[0]}</p>
          )}
        </div>

        {/* SLUG (Opcional visualmente, pero bueno para SEO) */}
        <div className="space-y-2">
          <Label htmlFor="slug">Slug (URL)</Label>
          <Input
            id="slug"
            name="slug"
            defaultValue={category?.slug}
            placeholder="ej: zapatillas-deportivas"
            className="font-mono text-sm"
          />
          <p className="text-[10px] text-muted-foreground">
            Déjalo vacío para generarlo automáticamente desde el nombre.
          </p>
          {state.errors?.slug && (
            <p className="text-red-500 text-xs">{state.errors.slug[0]}</p>
          )}
        </div>

        {/* ORDEN */}
        <div className="space-y-2">
          <Label htmlFor="sort">Orden de prioridad</Label>
          <Input
            id="sort"
            name="sort"
            type="number"
            defaultValue={category?.sort ?? 0}
            className="max-w-[120px]"
          />
          <p className="text-[10px] text-muted-foreground">
            Número menor aparece primero en el menú (0, 1, 2...).
          </p>
          {state.errors?.sort && (
            <p className="text-red-500 text-xs">{state.errors.sort[0]}</p>
          )}
        </div>
      </div>

      <div className="flex items-center justify-end gap-3">
        <Button variant="outline" asChild>
          <Link href="/admin/categories">Cancelar</Link>
        </Button>
        <Button
          type="submit"
          disabled={isPending}
          className="bg-black text-white"
        >
          {isPending
            ? "Guardando..."
            : isEditing
              ? "Guardar Cambios"
              : "Crear Categoría"}
        </Button>
      </div>
    </form>
  );
}
