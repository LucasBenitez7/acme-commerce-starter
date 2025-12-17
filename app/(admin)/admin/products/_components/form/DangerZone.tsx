"use client";

import { useRouter } from "next/navigation";
import { FaBoxArchive, FaBoxOpen } from "react-icons/fa6";
import { toast } from "sonner";

import { Button } from "@/components/ui/button";

import { toggleProductArchive } from "@/app/(admin)/admin/products/actions";

import { DeleteProductDialog } from "../DeleteProductDialog";

type Props = {
  productId: string;
  productName: string;
  isArchived: boolean;
};

export function DangerZone({ productId, productName, isArchived }: Props) {
  const router = useRouter();

  const handleArchiveToggle = async () => {
    const newState = !isArchived;
    const res = await toggleProductArchive(productId, newState);

    if (res?.error) {
      toast.error(res.error);
    } else {
      toast.success(newState ? "Producto archivado" : "Producto reactivado");
      router.refresh();
    }
  };

  return (
    <div className="mt-12 pt-8 border-t border-red-100 space-y-6">
      <h3 className="text-lg font-medium text-neutral-900">
        Gestión de Estado
      </h3>

      <div className="grid gap-4 md:grid-cols-2">
        {/* Archivar */}
        <div className="flex items-center justify-between bg-neutral-50 border border-neutral-200 p-4 rounded-md">
          <div>
            <p className="text-sm font-medium text-neutral-900">
              {isArchived ? "Reactivar Producto" : "Archivar Producto"}
            </p>
            <p className="text-xs text-neutral-500 mt-1">
              {isArchived
                ? "El producto volverá a ser visible."
                : "Ocultar de la tienda, mantener historial."}
            </p>
          </div>
          <Button
            variant="secondary"
            onClick={handleArchiveToggle}
            className="bg-white border hover:bg-neutral-100"
            size="sm"
          >
            {isArchived ? (
              <>
                <FaBoxOpen className="mr-2 h-4 w-4" /> Reactivar
              </>
            ) : (
              <>
                <FaBoxArchive className="mr-2 h-4 w-4" /> Archivar
              </>
            )}
          </Button>
        </div>

        {/* Eliminar */}
        <div className="flex items-center justify-between bg-red-50 border border-red-100 p-4 rounded-md">
          <div>
            <p className="text-sm font-medium text-red-900">Zona de Peligro</p>
            <p className="text-xs text-red-700 mt-1">
              Esta acción no se puede deshacer.
            </p>
          </div>
          <DeleteProductDialog
            productId={productId}
            productName={productName}
          />
        </div>
      </div>
    </div>
  );
}
