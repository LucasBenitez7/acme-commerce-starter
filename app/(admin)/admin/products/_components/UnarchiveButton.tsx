"use client";

import { useState } from "react";
import { FaBoxOpen, FaSpinner } from "react-icons/fa6";
import { toast } from "sonner";

import { Button } from "@/components/ui/button";

import { toggleProductArchive } from "../actions";

export function UnarchiveButton({ productId }: { productId: string }) {
  const [loading, setLoading] = useState(false);

  const handleUnarchive = async () => {
    setLoading(true);
    const res = await toggleProductArchive(productId, false);

    if (res?.error) {
      toast.error(res.error);
    } else {
      toast.success("Producto restaurado al catálogo");
    }
    setLoading(false);
  };

  return (
    <Button
      onClick={handleUnarchive}
      disabled={loading}
      variant="outline"
      size="sm"
      className="hover:bg-green-50 hover:text-green-700 hover:border-green-200 transition-colors"
    >
      {loading ? (
        <FaSpinner className="mr-2 h-3 w-3 animate-spin" />
      ) : (
        <FaBoxOpen className="mr-2 h-3 w-3" />
      )}
      Desarchivar
    </Button>
  );
}
