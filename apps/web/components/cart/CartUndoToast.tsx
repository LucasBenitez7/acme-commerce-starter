"use client";

import { useEffect, useState } from "react";

import { useAppDispatch } from "@/hooks/use-app-dispatch";
import { useAppSelector } from "@/hooks/use-app-selector";
import { restoreLastRemovedItem } from "@/store/cart.slice";

export function CartUndoToast() {
  const dispatch = useAppDispatch();
  const lastRemovedItem = useAppSelector((state) => state.cart.lastRemovedItem);
  const [visible, setVisible] = useState(false);

  useEffect(() => {
    if (!lastRemovedItem) return;

    setVisible(true);

    const t = setTimeout(() => {
      setVisible(false);
    }, 6000); // 6s visible

    return () => clearTimeout(t);
  }, [lastRemovedItem]);

  if (!lastRemovedItem || !visible) return null;

  return (
    <div className="fixed right-0 z-[200] flex w-[min(90vw,420px)] items-center justify-between gap-3 rounded-lb border bg-background px-3 py-2 text-sm shadow-lg">
      <div className="flex flex-col">
        <span className="font-medium">Producto eliminado</span>
        <span className="max-w-[260px] truncate text-xs text-muted-foreground">
          {lastRemovedItem.slug} (x{lastRemovedItem.qty})
        </span>
      </div>
      <button
        type="button"
        className="text-sm font-semibold fx-underline-anim z-[200] "
        onClick={() => {
          dispatch(restoreLastRemovedItem());
          setVisible(false);
        }}
      >
        Deshacer
      </button>
    </div>
  );
}
