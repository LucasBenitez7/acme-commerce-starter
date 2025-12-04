"use client";

import { FaRegTrashCan, FaTrashCan } from "react-icons/fa6";

type CartRemoveButtonProps = {
  onRemove: () => void;
  className?: string;
};

export function RemoveButton({ onRemove, className }: CartRemoveButtonProps) {
  return (
    <button
      type="button"
      className={`
<<<<<<< HEAD
         group relative flex h-6 w-6 items-center justify-center rounded-xs hover:cursor-pointer
=======
         group relative flex h-6 w-6 items-center justify-center rounded-lb mb-1 hover:cursor-pointer
>>>>>>> b4c8f25 (feat(fase-6): pedidos con datos de envío en Prisma + vista demo de orders (#29))
        ${className ?? ""}
      `}
      aria-label="Quitar de la cesta"
      onClick={onRemove}
    >
      {/* Icono outline (normal) */}
      <FaRegTrashCan
        className="size-[18px] text-foreground transition-opacity group-hover:opacity-0"
        aria-hidden="true"
      />

      {/* Icono relleno (hover) */}
      <FaTrashCan
        className="pointer-events-none absolute size-[18px] text-foreground opacity-0 transition-opacity group-hover:opacity-100"
        aria-hidden="true"
      />
    </button>
  );
}
