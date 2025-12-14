"use client";
import { usePathname, useSearchParams } from "next/navigation";
import { useEffect } from "react";

export function useAutoCloseOnRouteChange(open: boolean, onClose: () => void) {
  const pathname = usePathname();
  const search = useSearchParams();

  useEffect(() => {
    if (!open) return;
    onClose();
  }, [pathname, search, onClose]);
}
