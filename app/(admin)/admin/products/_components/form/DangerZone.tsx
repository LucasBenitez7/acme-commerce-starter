"use client";

import { ArchiveButton } from "../ArchiveButton";
import { DeleteProductDialog } from "../DeleteProductDialog";

type Props = {
  productId: string;
  productName: string;
  isArchived: boolean;
};

export function DangerZone({ productId, productName, isArchived }: Props) {
  return (
    <div className="mt-12 pt-8 border-t border-red-100 space-y-6">
      <h3 className="text-lg font-medium text-neutral-900">
        Gestión de Estado
      </h3>

      <div className="grid gap-4 md:grid-cols-2">
        {/* CAJA 1: ARCHIVAR */}
        <div className="flex items-center justify-between bg-neutral-50 border border-neutral-200 p-4 rounded-md">
          <div>
            <p className="text-sm font-medium text-neutral-900">
              {isArchived ? "Reactivar Producto" : "Archivar Producto"}
            </p>
            <p className="text-xs text-neutral-500 mt-1">
              {isArchived
                ? "El producto volverá a ser visible en la tienda."
                : "Ocultar de la tienda sin perder el historial."}
            </p>
          </div>

          <ArchiveButton
            productId={productId}
            productName={productName}
            isArchived={isArchived}
            showLabel={true}
          />
        </div>

        {/* CAJA 2: ELIMINAR */}
        <div className="flex items-center justify-between bg-red-50 border border-red-100 p-4 rounded-md">
          <div>
            <p className="text-sm font-medium text-red-900">Zona de Peligro</p>
            <p className="text-xs text-red-700 mt-1">
              Eliminar permanentemente. No se puede deshacer.
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
