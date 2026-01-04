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

import { CategorySortPreview } from "./CategorySortPreview";

type Props = {
  category?: {
    id: string;
    name: string;
    slug: string;
    sort: number;
  };
  // NUEVA PROP: Recibimos la lista de referencia
  existingCategories?: { id: string; name: string; sort: number }[];
};

const INITIAL_STATE: CategoryFormState = {
  message: "",
  errors: {},
};

export function CategoryForm({ category, existingCategories = [] }: Props) {
  const isEditing = !!category;

  const action = isEditing
    ? updateCategoryAction.bind(null, category.id)
    : createCategoryAction;

  const [state, formAction, isPending] = useActionState<
    CategoryFormState,
    FormData
  >(action, INITIAL_STATE);

  useEffect(() => {
    if (state.message) toast.error(state.message);
    if (state.errors && Object.keys(state.errors).length > 0) {
      toast.error("Revisa los campos marcados.");
    }
  }, [state]);

  return (
    <div className="grid gap-8 lg:grid-cols-[300px_1fr] items-start">
      {/* COLUMNA IZQUIERDA */}
      <div className="lg:block">
        <CategorySortPreview
          existingCategories={existingCategories}
          currentId={category?.id}
        />
      </div>

      {/* COLUMNA DERECHA*/}
      <form action={formAction} className="space-y-6">
        <div className="grid gap-6 bg-background px-4 py-6 rounded-xs border shadow-sm">
          <div className="space-y-2">
            <Label htmlFor="name">Nombre</Label>
            <Input
              id="name"
              name="name"
              defaultValue={category?.name}
              placeholder="Ej: Zapatillas"
              autoFocus={!isEditing}
              aria-invalid={!!state.errors?.name}
              className={state.errors?.name ? "border-red-500" : ""}
            />
            {state.errors?.name && (
              <p className="text-red-500 text-xs">{state.errors.name[0]}</p>
            )}
          </div>

          <div className="space-y-2">
            <Label htmlFor="sort">Prioridad (Orden)</Label>
            <Input
              id="sort"
              name="sort"
              type="number"
              defaultValue={category?.sort ?? 0}
              className="max-w-[120px]"
            />
            <p className="text-xs text-muted-foreground">
              Menor número = Más arriba en el menú.
            </p>
          </div>
        </div>

        <div className="flex items-center justify-end gap-3">
          <Button
            variant="outline"
            asChild
            type="button"
            className="p-3 flex-1 lg:flex-0"
          >
            <Link href="/admin/categories">Cancelar</Link>
          </Button>
          <Button
            type="submit"
            variant={"default"}
            disabled={isPending}
            className="p-3 flex-1 lg:flex-0"
          >
            {isPending ? "Guardando..." : isEditing ? "Guardar" : "Crear"}
          </Button>
        </div>
      </form>
    </div>
  );
}
