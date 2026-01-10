"use client";

import { FaXmark } from "react-icons/fa6";

import { cn } from "@/lib/utils";

import type { PresetColor, PresetSize } from "@/lib/products/types";

// COLOR
interface ColorChipProps extends PresetColor {
  isSelected: boolean;
  isEditMode: boolean;
  hasError?: boolean;
  onToggle: (name: string) => void;
  onDelete: (id: string, name: string) => void;
}

export const ColorChip = ({
  id,
  name,
  hex,
  isSelected,
  isEditMode,
  hasError,
  onToggle,
  onDelete,
}: ColorChipProps) => {
  const canDelete = isEditMode;

  return (
    <div
      onClick={() => !isEditMode && onToggle(name)}
      className={cn(
        "group relative flex items-center gap-2 px-3 py-1.5 text-sm border rounded-xs transition-all select-none bg-background",
        !isEditMode && "cursor-pointer hover:border-foreground",
        !isEditMode && isSelected
          ? "bg-foreground text-background border-foreground"
          : "text-slate-700",
        isEditMode && "cursor-default",

        hasError && "border-red-500 text-red-700 bg-background",
      )}
    >
      <div
        className={cn("w-3 h-3 rounded-full border border-neutral-200")}
        style={{ background: hex }}
      />

      {name}

      {canDelete && (
        <div
          role="button"
          className="absolute -top-2 -right-2 flex h-5 w-5 bg-red-500 text-white rounded-full items-center justify-center shadow-sm hover:bg-red-600 z-10 animate-in zoom-in duration-200 cursor-pointer"
          onClick={(e) => {
            e.stopPropagation();
            onDelete(id, name);
          }}
          title="Borrar color"
        >
          <FaXmark className="size-3" />
        </div>
      )}
    </div>
  );
};

// SIZE
interface SizeChipProps extends Partial<PresetSize> {
  name: string;
  dbId?: string;
  isSelected: boolean;
  isEditMode: boolean;
  onToggle: (name: string) => void;
  onDelete: (id: string, name: string) => void;
}

export const SizeChip = ({
  name,
  dbId,
  isSelected,
  isEditMode,
  onToggle,
  onDelete,
}: SizeChipProps) => {
  const canDelete = isEditMode && !!dbId;

  return (
    <div
      onClick={() => !isEditMode && onToggle(name)}
      className={cn(
        "group relative flex items-center justify-center px-3 py-1.5 text-sm border rounded-xs transition-all select-none bg-background",
        !isEditMode && "cursor-pointer hover:border-foreground",
        !isEditMode && isSelected
          ? "bg-foreground text-background border-foreground"
          : "text-slate-700",
        isEditMode && "cursor-default",
      )}
    >
      {name}
      {canDelete && (
        <div
          role="button"
          className="absolute -top-2 -right-2 flex h-5 w-5 bg-red-500 text-white rounded-full items-center justify-center shadow-sm hover:bg-red-600 z-10 animate-in zoom-in duration-200 cursor-pointer"
          onClick={(e) => {
            e.stopPropagation();
            onDelete(dbId!, name);
          }}
          title="Borrar talla"
        >
          <FaXmark className="size-3" />
        </div>
      )}
    </div>
  );
};
