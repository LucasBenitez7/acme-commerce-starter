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
    ? "absolute -translate-x-1/2  h-[0.160rem] rounded-md bg-slate-600 group-transition-[transform,opacity,background-color,filter] duration-400 transform-gpu motion-reduce:transition-none "
    : "absolute -translate-x-1/2 h-[0.160rem] rounded-md bg-slate-600 group-transition-[transform,opacity,background-color,filter] duration-200 transform-gpu motion-reduce:transition-none";

  return (
    <div className="tip-right" data-tip={open ? "Cerrar menú" : "Abrir menú"}>
      <button
        type="button"
        onClick={onToggle}
        aria-label={open ? "Cerrar menú" : "Abrir menú"}
        aria-expanded={open}
        aria-controls={controlsId}
        className={[
          "group relative h-[30px] w-[32px] rounded-sm cursor-pointer select-none outline outline-white hover:outline hover:outline-slate-300 hover:bg-neutral-100 transition-all duration-200 ease-in-out",
          className ?? "",
        ].join(" ")}
      >
        <span
          className={[
            barBase,
            open
              ? "top-1/2 -translate-y-1/2 -rotate-135 w-[20px]"
              : "top-[7px] w-[20px] rotate-0",
          ].join(" ")}
        />
        <span
          className={[
            barBase,
            "top-1/2 right-[2.1px] -translate-y-1/2",
            open ? "opacity-0 w-0" : "opacity-100 w-[1rem] right-[2.1px]",
          ].join(" ")}
        />
        <span
          className={[
            barBase,
            open
              ? "top-1/2 -translate-y-1/2 -rotate-45 w-[20px]"
              : "bottom-[7px] w-[20px] rotate-0",
          ].join(" ")}
        />
      </button>
    </div>
  );
}
