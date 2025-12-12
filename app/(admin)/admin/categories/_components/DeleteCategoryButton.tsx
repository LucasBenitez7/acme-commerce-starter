"use client";

import { useState } from "react";
import { toast } from "sonner";

import { Button } from "@/components/ui/button";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";

import { deleteCategoryAction } from "@/app/(admin)/admin/categories/actions";

interface Props {
  id: string;
  hasProducts: boolean;
}

export function DeleteCategoryButton({ id, hasProducts }: Props) {
  const [open, setOpen] = useState(false);
  const [loading, setLoading] = useState(false);

  // Verificación inicial antes de abrir el diálogo
  const handleOpenCheck = () => {
    if (hasProducts) {
      toast.error(
        "No puedes borrar una categoría que tiene productos. Elimina o mueve los productos primero.",
      );
      return;
    }
    setOpen(true);
  };

  // Acción real de borrado
  const handleDelete = async () => {
    setLoading(true);
    try {
      const res = await deleteCategoryAction(id);

      if (res?.error) {
        toast.error(res.error);
      } else {
        toast.success("Categoría eliminada correctamente");
        setOpen(false);
      }
    } catch (error) {
      toast.error("Ocurrió un error inesperado");
    } finally {
      setLoading(false);
    }
  };

  return (
    <>
      <Button
        variant="destructive"
        onClick={handleOpenCheck}
        disabled={loading}
        className="bg-red-600 hover:bg-red-700 text-white shadow-sm font-semibold"
      >
        Borrar
      </Button>

      <Dialog open={open} onOpenChange={setOpen}>
        <DialogContent className="sm:max-w-[425px]">
          <DialogHeader>
            <DialogTitle className="text-xl">¿Eliminar categoría?</DialogTitle>
            <DialogDescription className="text-slate-600 font-medium pt-2">
              Esta acción es irreversible. La categoría se eliminará
              permanentemente de la base de datos.
            </DialogDescription>
          </DialogHeader>

          <DialogFooter className="gap-4 pt-4">
            <Button
              variant="outline"
              onClick={() => setOpen(false)}
              disabled={loading}
              className="border-slate-300 text-slate-700 hover:bg-slate-50 font-semibold"
            >
              Cancelar
            </Button>
            <Button
              variant="destructive"
              onClick={handleDelete}
              disabled={loading}
              className="bg-red-600 hover:bg-red-700 text-white font-bold shadow-sm"
            >
              {loading ? "Eliminando..." : "Confirmar Eliminación"}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </>
  );
}
