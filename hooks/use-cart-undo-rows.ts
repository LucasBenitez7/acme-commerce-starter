"use client";

import { useEffect, useMemo } from "react";

import { useAppDispatch } from "@/hooks/use-app-dispatch";
import { useAppSelector } from "@/hooks/use-app-selector";
import { clearUndoStack, restoreFromStack } from "@/store/cart.slice";

import type { LastRemovedStackEntry } from "@/store/cart.types";

type UndoRow<T> =
  | { kind: "row"; row: T }
  | { kind: "undo"; entry: LastRemovedStackEntry };

export function useCartUndoRows<T extends { slug: string }>(rows: T[]) {
  const dispatch = useAppDispatch();
  const undoStack = useAppSelector(
    (state) => state.cart.lastRemovedStack ?? [],
  );

  // Autolimpiar stack después de X ms desde el último cambio
  useEffect(() => {
    if (!undoStack.length) return;

    const t = setTimeout(() => {
      dispatch(clearUndoStack());
    }, 6000);

    return () => clearTimeout(t);
  }, [undoStack.length, dispatch]);

  const rowsWithUndo: UndoRow<T>[] = useMemo(() => {
    if (!rows.length && !undoStack.length) return [];

    const byIndex = new Map<number, LastRemovedStackEntry[]>();

    undoStack.forEach((entry) => {
      const insertionIndex = Math.min(entry.index ?? rows.length, rows.length);
      const bucket = byIndex.get(insertionIndex);
      if (bucket) {
        bucket.push(entry);
      } else {
        byIndex.set(insertionIndex, [entry]);
      }
    });

    const result: UndoRow<T>[] = [];

    for (let i = 0; i <= rows.length; i++) {
      const entriesHere = byIndex.get(i);
      if (entriesHere) {
        for (const entry of entriesHere) {
          result.push({ kind: "undo", entry });
        }
      }
      if (i < rows.length) {
        result.push({ kind: "row", row: rows[i] });
      }
    }

    return result;
  }, [rows, undoStack]);

  const handleUndo = (removedAt: number) =>
    dispatch(restoreFromStack({ removedAt }));

  return { undoStack, rowsWithUndo, handleUndo };
}
