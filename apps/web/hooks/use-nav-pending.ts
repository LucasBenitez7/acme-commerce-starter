"use client";
import { usePathname, useRouter, useSearchParams } from "next/navigation";
import { useCallback, useEffect, useState, useTransition } from "react";

export function useNavPending() {
  const router = useRouter();
  const pathname = usePathname();
  const search = useSearchParams();

  const [clicked, setClicked] = useState(false);
  const [isPending, startTransition] = useTransition();

  // Cuando cambia la ruta o la query, liberamos el bloqueo
  useEffect(() => {
    if (clicked) setClicked(false);
  }, [pathname, search?.toString(), clicked]);

  const navigate = useCallback(
    (href: string, opts?: { replace?: boolean; scroll?: boolean }) => {
      if (isPending || clicked) return; // ya hay navegación en curso
      setClicked(true);
      startTransition(() => {
        const scroll = opts?.scroll ?? true;
        if (opts?.replace) router.replace(href, { scroll });
        else router.push(href, { scroll });
      });
    },
    [router, isPending, clicked],
  );

  return { isPending: isPending || clicked, navigate };
}
