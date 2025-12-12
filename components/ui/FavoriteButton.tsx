"use client";

import { FaRegHeart, FaHeart } from "react-icons/fa";

type CartFavoriteButtonProps = {
  isFavorite: boolean;
  onToggle: () => void;
  className?: string;
};

export function FavoriteButton({
  isFavorite,
  onToggle,
  className,
}: CartFavoriteButtonProps) {
  return (
    <button
      type="button"
      className={`
        group relative flex h-5 w-5 items-center justify-center rounded-xs hover:cursor-pointer
        ${className ?? ""}
      `}
      aria-label={isFavorite ? "Quitar de favoritos" : "Agregar a favoritos"}
      aria-pressed={isFavorite}
      onClick={onToggle}
    >
      {/* Icono outline (por defecto) */}
      <FaRegHeart
        className={`
          size-[18px] text-foreground transition-opacity stroke-0
          ${isFavorite ? "opacity-0" : "opacity-100 group-hover:opacity-0"}
        `}
        aria-hidden="true"
      />

      {/* Icono relleno (hover y/o activo) */}
      <FaHeart
        className={`
          pointer-events-none absolute size-[18px] text-foreground transition-opacity
          ${isFavorite ? "opacity-100" : "opacity-0 group-hover:opacity-100"}
        `}
        aria-hidden="true"
      />
    </button>
  );
}
