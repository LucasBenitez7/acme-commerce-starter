"use client";

import React from "react";

type Props = {
  open: boolean;
  onToggle: () => void;
  controlsId?: string;
  className?: string;
};

export function BurgerButton({ open, onToggle, controlsId, className }: Props) {
  const barBase = open
    ? "absolute h-[0.170rem] rounded-md bg-slate-900 group-transition-[transform,opacity,background-color,filter] duration-400 transform-gpu motion-reduce:transition-none "
    : "absolute h-[0.170rem] rounded-md bg-slate-900 group-transition-[transform,opacity,background-color,filter] duration-200 transform-gpu motion-reduce:transition-none ";

  return (
    <button
      type="button"
      onClick={onToggle}
      aria-label={open ? "Cerrar menú" : "Abrir menú"}
      aria-expanded={open}
      aria-controls={controlsId}
      className={[
        "group relative flex h-[32px] w-[24px] rounded-xs cursor-pointer select-none;",
        className ?? "",
      ].join(" ")}
    >
      {/* barra superior */}
      <span
        className={[
          barBase,
          open
            ? "top-1/2 -translate-y-1/2 -rotate-135 w-[20px]"
            : "top-[8px] w-[20px] rotate-0",
        ].join(" ")}
      />
      {/* barra media (crossfade limpio con escala, anclado al centro) */}
      <span
        className={[
          barBase,
          "top-1/2 -translate-y-1/2",
          open ? "opacity-0 w-0" : "opacity-100 w-[16px]",
        ].join(" ")}
      />
      {/* barra inferior */}
      <span
        className={[
          barBase,
          open
            ? "top-1/2 -translate-y-1/2 -rotate-45 w-[20px]"
            : "bottom-[8px] w-[20px] rotate-0",
        ].join(" ")}
      />
    </button>
  );
}
