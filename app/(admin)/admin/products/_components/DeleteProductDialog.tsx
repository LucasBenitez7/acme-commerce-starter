"use client";

import { useRouter } from "next/navigation";
import { useState } from "react";
import { FaTrash, FaTriangleExclamation } from "react-icons/fa6";
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

export function DeleteProductDialog({
  productId,
  productName,
}: {
  productId: string;
  productName: string;
}) {
  const [open, setOpen] = useState(false);
  const [isDeleting, setIsDeleting] = useState(false);
  const router = useRouter();

  const handleDelete = async () => {
    setIsDeleting(true);
    const res = await deleteProductAction(productId);

    if (res.error) {
      toast.error(res.error);
      setIsDeleting(false);
      setOpen(false);
    } else {
      toast.success("Producto eliminado correctamente");
      setOpen(false);
      router.push("/admin/products"); // Volver al listado
      router.refresh();
    }
  };

  return (
    <AlertDialog open={open} onOpenChange={setOpen}>
      <AlertDialogTrigger asChild>
        <Button variant="destructive" type="button">
          <FaTrash className="mr-2 h-4 w-4" /> Eliminar Producto
        </Button>
      </AlertDialogTrigger>
      <AlertDialogContent>
        <AlertDialogHeader>
          <AlertDialogTitle className="flex items-center gap-2 text-red-600">
            <FaTriangleExclamation /> ¿Estás absolutamente seguro?
          </AlertDialogTitle>
          <AlertDialogDescription>
            Estás a punto de eliminar <strong>{productName}</strong>. Esta
            acción borrará permanentemente el producto, sus variantes y su
            historial de imágenes.
            <br />
            <br />
            Si el producto tiene pedidos asociados, esta acción podría fallar o
            dejar los pedidos sin referencia.
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
            {isDeleting ? "Eliminando..." : "Sí, eliminar"}
          </AlertDialogAction>
        </AlertDialogFooter>
      </AlertDialogContent>
    </AlertDialog>
  );
}
