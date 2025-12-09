"use client";

import { useEffect, useActionState } from "react";
import { toast } from "sonner";

import { Button, Input, Label } from "@/components/ui";

import {
  createCategoryAction,
  updateCategoryAction,
  type CategoryFormState,
} from "@/app/(admin)/admin/categories/actions";

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
    if (state.message && state.message !== "") {
      toast.error(state.message);
    }
  }, [state]);

  return (
    <form
      action={formAction}
      className="space-y-6 max-w-lg bg-white p-6 rounded-xs border shadow-sm"
    >
      <div className="space-y-2">
        <Label>Nombre (Menú)</Label>
        <Input
          name="name"
          defaultValue={category?.name}
          placeholder="Ej: Zapatillas"
        />
        {state.errors?.name && (
          <p className="text-red-500 text-xs">{state.errors.name[0]}</p>
        )}
      </div>

      <div className="space-y-2">
        <Label>Orden (Prioridad en menú)</Label>
        <Input name="sort" type="number" defaultValue={category?.sort ?? 0} />
        <p className="text-xs text-muted-foreground">
          0 sale primero, 10 sale último.
        </p>
        {state.errors?.sort && (
          <p className="text-red-500 text-xs">{state.errors.sort[0]}</p>
        )}
      </div>

      <div className="flex justify-end gap-3">
        <Button
          type="button"
          variant="outline"
          onClick={() => window.history.back()}
        >
          Cancelar
        </Button>
        <Button type="submit" disabled={isPending}>
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
