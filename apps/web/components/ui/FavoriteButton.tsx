"use client";

<<<<<<< HEAD
import { FaRegHeart, FaHeart } from "react-icons/fa";
=======
import { FaRegHeart, FaHeart } from "react-icons/fa6";
>>>>>>> b4c8f25 (feat(fase-6): pedidos con datos de envío en Prisma + vista demo de orders (#29))

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
<<<<<<< HEAD
        group relative flex h-5 w-5 items-center justify-center rounded-xs hover:cursor-pointer
=======
        group relative flex h-6 w-6 items-center justify-center rounded-lb hover:cursor-pointer
>>>>>>> b4c8f25 (feat(fase-6): pedidos con datos de envío en Prisma + vista demo de orders (#29))
        ${className ?? ""}
      `}
      aria-label={isFavorite ? "Quitar de favoritos" : "Agregar a favoritos"}
      aria-pressed={isFavorite}
      onClick={onToggle}
    >
      {/* Icono outline (por defecto) */}
      <FaRegHeart
        className={`
<<<<<<< HEAD
          size-[18px] text-foreground transition-opacity stroke-0
=======
          size-[20px] text-foreground transition-opacity
>>>>>>> b4c8f25 (feat(fase-6): pedidos con datos de envío en Prisma + vista demo de orders (#29))
          ${isFavorite ? "opacity-0" : "opacity-100 group-hover:opacity-0"}
        `}
        aria-hidden="true"
      />

      {/* Icono relleno (hover y/o activo) */}
      <FaHeart
        className={`
<<<<<<< HEAD
          pointer-events-none absolute size-[18px] text-foreground transition-opacity
=======
          pointer-events-none absolute size-[20px] text-foreground transition-opacity
>>>>>>> b4c8f25 (feat(fase-6): pedidos con datos de envío en Prisma + vista demo de orders (#29))
          ${isFavorite ? "opacity-100" : "opacity-0 group-hover:opacity-100"}
        `}
        aria-hidden="true"
      />
    </button>
  );
}
