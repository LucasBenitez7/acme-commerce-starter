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
  const textSize =
    size === "sm" ? "text-xs sm:text-sm" : "text-sm sm:text-base";

  return (
    <div className={cn(className)}>
      <div
        className={cn(
          "flex items-center justify-between rounded-xs border mt-2 px-2 py-4 font-semibold text-foreground",
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
