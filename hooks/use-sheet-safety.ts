"use client";
import { useCallback, type Dispatch, type SetStateAction } from "react";

export function useSheetSafety<T extends HTMLElement = HTMLElement>({
  open,
  setOpen,
  safeRef,
  sheetId,
}: {
  open: boolean;
  setOpen: Dispatch<SetStateAction<boolean>>;
  safeRef: { current: T | null };
  sheetId: string;
}) {
  const inSafeZone = useCallback(
    (node: Element | null) => {
      const headerEl = (safeRef.current ?? null) as HTMLElement | null;
      const sheetEl =
        typeof document !== "undefined"
          ? (document.getElementById(sheetId) as HTMLElement | null)
          : null;
      return !!(node && (headerEl?.contains(node) || sheetEl?.contains(node)));
    },
    [safeRef, sheetId],
  );

  const closeIfOutside = useCallback(
    (x: number, y: number, related?: EventTarget | null) => {
      if (!open) return;
      if (!related) return;
      if (typeof document === "undefined") return;

      const el = document.elementFromPoint(x, y) as Element | null;
      if (!el) return;
      if (inSafeZone(el)) return;

      setOpen(false);
    },
    [open, inSafeZone, setOpen],
  );

  const handlePointerLeaveHeader: React.PointerEventHandler<HTMLElement> = (
    e,
  ) => {
    if (e.pointerType !== "mouse") return;
    closeIfOutside(e.clientX, e.clientY, e.relatedTarget);
  };

  const handlePointerLeaveSheet: React.PointerEventHandler<HTMLDivElement> = (
    e,
  ) => {
    if (e.pointerType !== "mouse") return;
    closeIfOutside(e.clientX, e.clientY, e.relatedTarget);
  };

  const handleAnyNavClickCapture: React.MouseEventHandler<HTMLElement> = (
    e,
  ) => {
    const target = e.target as HTMLElement | null;
    const anchor = target?.closest<HTMLAnchorElement>("a[href]");
    if (!anchor) return;
    if (anchor.getAttribute("target") === "_blank") return;
    if (anchor.dataset.keepOpen === "true") return;
    setOpen(false);
  };

  const onInteractOutside = (e: any) => {
    const t = e?.target as Node | null;
    const headerEl = (safeRef.current ?? null) as HTMLElement | null;
    if (t && headerEl?.contains(t)) {
      e.preventDefault?.();
      return;
    }
    setOpen(false);
  };

  return {
    handlePointerLeaveHeader,
    handlePointerLeaveSheet,
    handleAnyNavClickCapture,
    onInteractOutside,
  };
}
