"use client";

import { useRouter } from "next/navigation";
import { useState } from "react";
import { FaBoxArchive, FaBoxOpen } from "react-icons/fa6";
import { toast } from "sonner";

import { Button } from "@/components/ui/button";

import { cn } from "@/lib/utils";

import { toggleProductArchive } from "@/app/(admin)/admin/products/actions";

type Props = {
  productId: string;
  productName: string;
  isArchived: boolean;
  showLabel?: boolean;
  className?: string;
};

export function ArchiveButton({
  productId,
  productName,
  isArchived,
  showLabel = false,
  className,
}: Props) {
  const [loading, setLoading] = useState(false);
  const router = useRouter();

  const targetState = !isArchived;

  const handleToggle = async (e: React.MouseEvent) => {
    e.preventDefault();
    e.stopPropagation();
    setLoading(true);

    const res = await toggleProductArchive(productId, targetState);

    if (res?.error) {
      toast.error(res.error);
    } else {
      const action = targetState ? "archivado" : "reactivado";
      toast.success(`Producto "${productName}" ${action}`);
      router.refresh();
    }
    setLoading(false);
  };

  return (
    <Button
      type="button"
      onClick={handleToggle}
      disabled={loading}
      variant={showLabel ? "secondary" : "ghost"}
      size={showLabel ? "sm" : "icon"}
      className={cn(
        "transition-colors",
        // Colores condicionales
        isArchived
          ? "text-green-600 hover:text-green-700 hover:bg-green-50"
          : "text-neutral-500 hover:text-amber-700 hover:bg-amber-50",
        showLabel && "bg-white border shadow-sm w-auto px-3",
        className,
      )}
      title={isArchived ? "Reactivar producto" : "Archivar producto"}
    >
      {isArchived ? (
        <FaBoxOpen className={cn("h-4 w-4", showLabel && "mr-2")} />
      ) : (
        <FaBoxArchive className={cn("h-4 w-4", showLabel && "mr-2")} />
      )}

      {showLabel ? (
        <span>{isArchived ? "Reactivar" : "Archivar"}</span>
      ) : (
        <span className="sr-only">{isArchived ? "Reactivar" : "Archivar"}</span>
      )}
    </Button>
  );
}
