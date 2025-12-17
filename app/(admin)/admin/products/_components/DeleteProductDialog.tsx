"use client";

import { useRouter } from "next/navigation";
import { useState } from "react";
import { FaTrash, FaTriangleExclamation, FaSpinner } from "react-icons/fa6";
import { toast } from "sonner";

import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
  AlertDialogTrigger,
} from "@/components/ui/alert-dialog";
import { Button } from "@/components/ui/button";

import { deleteProductAction } from "../actions";

interface Props {
  productId: string;
  productName: string;
  asIcon?: boolean;
}

export function DeleteProductDialog({
  productId,
  productName,
  asIcon = false,
}: Props) {
  const [open, setOpen] = useState(false);
  const [isDeleting, setIsDeleting] = useState(false);
  const router = useRouter();

  const handleDelete = async () => {
    setIsDeleting(true);
    const res = await deleteProductAction(productId);

    if (res?.error) {
      toast.error(res.error);
      setIsDeleting(false);
    } else {
      toast.success("Producto eliminado correctamente");
      setOpen(false);
      if (!asIcon) {
        router.push("/admin/products");
      } else {
        router.refresh();
      }
    }
  };

  return (
    <AlertDialog open={open} onOpenChange={setOpen}>
      <AlertDialogTrigger asChild>
        {asIcon ? (
          // Versión Icono (para tablas)
          <Button
            variant="ghost"
            size="icon"
            className="h-8 w-8 text-neutral-400 hover:text-red-600 hover:bg-red-50"
          >
            <FaTrash className="h-4 w-4" />
          </Button>
        ) : (
          // Versión Botón Completo (para DangerZone)
          <Button variant="destructive">
            <FaTrash className="mr-2 h-4 w-4" /> Eliminar Producto
          </Button>
        )}
      </AlertDialogTrigger>
      <AlertDialogContent>
        <AlertDialogHeader>
          <AlertDialogTitle className="flex items-center gap-2 text-red-600">
            <FaTriangleExclamation /> ¿Estás absolutamente seguro?
          </AlertDialogTitle>
          <AlertDialogDescription>
            Estás a punto de eliminar <strong>{productName}</strong>. Esta
            acción es irreversible.
            <br />
            <br />
            Si el producto ya tiene ventas, el sistema impedirá la eliminación
            para proteger tus datos contables. En ese caso, archívalo.
          </AlertDialogDescription>
        </AlertDialogHeader>
        <AlertDialogFooter>
          <AlertDialogCancel disabled={isDeleting}>Cancelar</AlertDialogCancel>
          <AlertDialogAction
            onClick={(e) => {
              e.preventDefault();
              handleDelete();
            }}
            className="bg-red-600 hover:bg-red-700 text-white"
            disabled={isDeleting}
          >
            {isDeleting ? (
              <>
                <FaSpinner className="mr-2 h-4 w-4 animate-spin" />{" "}
                Eliminando...
              </>
            ) : (
              "Sí, eliminar permanentemente"
            )}
          </AlertDialogAction>
        </AlertDialogFooter>
      </AlertDialogContent>
    </AlertDialog>
  );
}
