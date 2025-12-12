"use client";

import { useState } from "react";
import { FaBoxArchive } from "react-icons/fa6";
import { toast } from "sonner";

import { Button } from "@/components/ui/button";

import { toggleProductArchive } from "../actions";

export function ArchiveButton({
  productId,
  productName,
}: {
  productId: string;
  productName: string;
}) {
  const [loading, setLoading] = useState(false);

  const handleArchive = async () => {
    setLoading(true);
    const res = await toggleProductArchive(productId, true);

    if (res.error) {
      toast.error(res.error);
    } else {
      toast.success(`Producto "${productName}" archivado`);
    }
    setLoading(false);
  };

  return (
    <Button
      type="button"
      onClick={handleArchive}
      disabled={loading}
      variant="ghost"
      size="icon"
      className="h-8 w-8  hover:bg-amber-50 hover:text-amber-700"
      title="Archivar (Ocultar de la tienda)"
    >
      <FaBoxArchive className="h-3.5 w-3.5" />
      <span className="">Archivar</span>
    </Button>
  );
}
