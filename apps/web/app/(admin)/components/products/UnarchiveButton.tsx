"use client";

import { useState } from "react";
import { FaBoxOpen } from "react-icons/fa6";
import { toast } from "sonner";

import { Button } from "@/components/ui/button";

import { toggleProductArchive } from "@/app/(admin)/admin/products/actions";

export function UnarchiveButton({ productId }: { productId: string }) {
  const [loading, setLoading] = useState(false);

  const handleUnarchive = async () => {
    setLoading(true);
    const res = await toggleProductArchive(productId, false); // false = no archivado (activo)
    if (res.error) toast.error(res.error);
    else toast.success("Producto restaurado al catálogo");
    setLoading(false);
  };

  return (
    <Button
      onClick={handleUnarchive}
      disabled={loading}
      variant="outline"
      size="sm"
      className="hover:bg-green-50 hover:text-green-700 hover:border-green-200"
    >
      <FaBoxOpen className="mr-2 h-3 w-3" />
      {loading ? "..." : "Desarchivar"}
    </Button>
  );
}
