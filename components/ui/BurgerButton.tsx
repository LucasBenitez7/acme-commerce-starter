"use client";

import React from "react";

type Props = {
  open: boolean;
  onToggle: () => void;
  controlsId?: string;
  className?: string;
  tooltip?: string;
};

export function BurgerButton({ open, onToggle, controlsId, className }: Props) {
  const barBase = open
    ? "absolute -translate-x-1/2 h-[0.130rem] rounded-xs bg-primary group-transition-[transform,opacity,background-color,filter] duration-400 transform-gpu motion-reduce:transition-none "
    : "absolute -translate-x-1/2 h-[0.130rem] rounded-xs bg-primary group-transition-[transform,opacity,background-color,filter] duration-200 transform-gpu motion-reduce:transition-none";

  return (
    <div className="tip-right" data-tip={open ? "Cerrar menú" : "Abrir menú"}>
      <button
        type="button"
        onClick={() => onToggle}
        aria-label={open ? "Cerrar menú" : "Abrir menú"}
        aria-expanded={open}
        aria-controls={controlsId}
        className={[
          "group relative h-[30px] w-[32px] rounded-xs cursor-pointer select-none outline-none hover:bg-neutral-100 transition-all duration-200 ease-in-out",
          className ?? "",
        ].join(" ")}
      >
        <span
          className={[
            barBase,
            open
              ? "top-1/2 -translate-y-1/2 -rotate-135 w-[18px]"
              : "top-[8px] w-[18px] rotate-0",
          ].join(" ")}
        />
        <span
          className={[
            barBase,
            "top-1/2 right-[1.2px] -translate-y-1/2",
            open ? "opacity-0 w-0" : "opacity-100 w-[1rem] right-[1.2px]",
          ].join(" ")}
        />
        <span
          className={[
            barBase,
            open
              ? "top-1/2 -translate-y-1/2 -rotate-45 w-[18px]"
              : "bottom-[8px] w-[18px] rotate-0",
          ].join(" ")}
        />
      </button>
    </div>
  );
}
