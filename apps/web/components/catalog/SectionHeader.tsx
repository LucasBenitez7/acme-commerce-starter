import { VscSettings } from "react-icons/vsc";

import type { ReactNode } from "react";

export function SectionHeader({
  title,
  rightSlot,
}: {
  title: string;
  rightSlot?: ReactNode;
}) {
  return (
    <header
      data-aria-hidden="true"
      aria-hidden="true"
      className="mt-6 mb-0 flex w-full items-center justify-between"
    >
      <h1 className="text-xl font-medium capitalize">{title}</h1>
      {rightSlot ?? (
        <button type="button" className="flex items-center gap-2">
          <VscSettings className="size-[18px] stroke-[0.5px]" />
          <span className="text-sm">Ordenar y Filtrar</span>
        </button>
      )}
    </header>
  );
}
