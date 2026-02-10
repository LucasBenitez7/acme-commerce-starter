import { VscSettings } from "react-icons/vsc";

import type { ReactNode } from "react";

export function SectionHeader({
  title,
  rightSlot,
  className,
}: {
  title: string;
  rightSlot?: ReactNode;
  className?: string;
}) {
  return (
    <header
      className={`${className} pt-6 flex w-full items-center justify-between px-4`}
    >
      <h1 className="text-2xl font-medium capitalize">{title}</h1>
      {rightSlot ?? (
        <button
          type="button"
          className="flex items-center gap-2 text-foreground"
        >
          <VscSettings className="size-[18px] stroke-[0.5px]" />
          <span className="text-sm">Ordenar y Filtrar</span>
        </button>
      )}
    </header>
  );
}
