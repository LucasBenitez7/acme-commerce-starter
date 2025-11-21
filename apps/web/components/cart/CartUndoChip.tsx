"use client";

import { cn } from "@/lib/utils";

import type { LastRemovedStackEntry } from "@/store/cart.types";

type CartUndoChipProps = {
  entry: LastRemovedStackEntry;
  onUndo: (removedAt: number) => void;
  className?: string;
  size?: "sm" | "md";
};

export function CartUndoChip({
  entry,
  onUndo,
  className,
  size = "md",
}: CartUndoChipProps) {
<<<<<<< HEAD
  const textSize = size === "sm" ? "text-xs sm:text-sm" : "text-xs sm:text-sm";
=======
  const textSize =
    size === "sm" ? "text-xs sm:text-sm" : "text-sm sm:text-base";
>>>>>>> b4c8f25 (feat(fase-6): pedidos con datos de envío en Prisma + vista demo de orders (#29))

  return (
    <div className={cn(className)}>
      <div
        className={cn(
<<<<<<< HEAD
          "flex items-center justify-between rounded-xs border mt-2 px-2 py-4 font-semibold text-foreground",
=======
          "flex items-center justify-between rounded-lb border px-2 py-4 font-semibold text-foreground bg-neutral-100",
>>>>>>> b4c8f25 (feat(fase-6): pedidos con datos de envío en Prisma + vista demo de orders (#29))
          textSize,
        )}
      >
        <div className="flex gap-1 truncate">
          <span className="capitalize truncate">{entry.slug}</span>
          <span className="shrink-0">- eliminado</span>
        </div>
        <button
          type="button"
          className="fx-underline-anim"
          onClick={() => onUndo(entry.removedAt)}
        >
          Deshacer
        </button>
      </div>
    </div>
  );
}
