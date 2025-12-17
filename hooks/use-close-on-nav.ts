"use client";

import { usePathname, useSearchParams } from "next/navigation";
import { useEffect } from "react";

export function useCloseOnNav(closeFn: () => void) {
  const pathname = usePathname();
  const searchParams = useSearchParams();

  useEffect(() => {
    closeFn();
  }, [pathname, searchParams, closeFn]);
}
