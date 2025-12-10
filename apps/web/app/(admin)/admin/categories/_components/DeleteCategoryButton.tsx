"use client";
import { useState } from "react";
import { FaTrash } from "react-icons/fa6";
import { toast } from "sonner";

import { Button } from "@/components/ui/button";

import { deleteCategoryAction } from "@/app/(admin)/admin/categories/actions";

export function DeleteCategoryButton({
  id,
  hasProducts,
}: {
  id: string;
  hasProducts: boolean;
}) {
  const [loading, setLoading] = useState(false);

  const handleDelete = async () => {
    if (hasProducts) {
      return toast.error(
        "No puedes borrar una categoría con productos. Muévelos o bórralos primero.",
      );
    }
    if (!confirm("¿Seguro que quieres borrar esta categoría?")) return;

    setLoading(true);
    const res = await deleteCategoryAction(id);
    if (res.error) toast.error(res.error);
    else toast.success("Categoría eliminada");
    setLoading(false);
  };

  return (
    <Button
      type="button"
      variant="ghost"
      size="icon"
      onClick={handleDelete}
      disabled={loading}
      className="h-8 w-8 hover:text-red-600 hover:bg-red-50"
    >
      <FaTrash className="h-3.5 w-3.5" />
    </Button>
  );
}
