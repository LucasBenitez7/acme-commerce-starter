"use client";

import { FaTrash } from "react-icons/fa6";

import { Button } from "@/components/ui/button";
import { Image } from "@/components/ui/image";

import { cn } from "@/lib/utils";

import { EditImageButton } from "./EditImageButton";

type ImageRowProps = {
  field: any;
  index: number;
  remove: (index: number) => void;
  onUpdate: (index: number, result: any) => void;
  uploadPreset: string | undefined;
  fieldError?: any;
  isFirstInGroup?: boolean;
};

export function ImageRow({
  field,
  index,
  remove,
  onUpdate,
  uploadPreset,
  fieldError,
  isFirstInGroup,
}: ImageRowProps) {
  const errObj = fieldError as any;
  const errorMessage =
    errObj?.message ||
    errObj?.url?.message ||
    errObj?.root?.message ||
    errObj?.color?.message;

  const hasError = !!errorMessage;

  let statusText = "";
  let statusColor = "text-muted-foreground";

  if (hasError) {
    statusText = errorMessage || "Error en imagen";
    statusColor = "text-red-600 font-bold";
  } else if (index === 0) {
    statusText = "PORTADA PRINCIPAL";
    statusColor = "font-semibold";
  } else if (isFirstInGroup) {
    statusText = "Portada del color";
    statusColor = "font-semibold";
  }

  return (
    <div
      className={cn(
        "group flex gap-2 items-center p-2 border rounded-xs bg-background transition-all hover:shadow-sm",
        hasError ? "border-red-500" : "border-neutral-200",
      )}
    >
      {/* 1. THUMBNAIL */}
      <div className="relative h-20 w-14 bg-neutral-100 border rounded-xs shrink-0 overflow-hidden">
        <Image
          src={field.url}
          alt={field.alt || "Imagen del producto"}
          fill
          className="object-cover"
          sizes="80px"
        />
      </div>

      {/* 2. INFORMACIÓN */}
      <div className="flex-1 h-full justify-between min-w-0 flex flex-col gap-1 pt-1">
        <p
          className="text-sm font-medium text-foreground truncate"
          title={field.alt}
        >
          {field.alt || "Sin nombre"}
        </p>

        {statusText && (
          <p
            className={cn(
              "text-[10px] bg-neutral-100 rounded w-fit p-1",
              statusColor,
            )}
          >
            {statusText}
          </p>
        )}
      </div>

      {/* 3. ACCIONES */}
      <div
        className={cn(
          "flex flex-col gap-1 border-l pl-1 self-stretch justify-evenly",
          hasError ? "border-red-200" : "border-neutral-300",
        )}
      >
        <EditImageButton
          uploadPreset={uploadPreset}
          onSuccess={(result) => onUpdate(index, result)}
        />

        <Button
          type="button"
          variant="ghost"
          size="sm"
          onClick={() => remove(index)}
          className="h-6 px-2 text-xs text-slate-700 active:text-red-600 active:bg-red-50 hover:text-red-600 hover:bg-red-50 flex gap-1.5 items-center justify-start w-full"
        >
          <FaTrash className="size-3" /> Borrar
        </Button>
      </div>
    </div>
  );
}
