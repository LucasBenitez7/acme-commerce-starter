"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";

import { Container } from "@/components/ui";

export function Footer() {
  const pathname = usePathname();

  const isCheckoutFlow: string[] = ["/checkout"];
  const hideFooter = isCheckoutFlow.includes(pathname);
  if (hideFooter) {
    return null;
  }

  return (
<<<<<<< HEAD
    <footer className="border-t px-4 bg-background">
=======
    <footer className="border-t px-4">
>>>>>>> b4c8f25 (feat(fase-6): pedidos con datos de envío en Prisma + vista demo de orders (#29))
      <Container className="py-8 text-sm text-neutral-600 flex flex-col gap-2 sm:flex-row sm:items-center sm:justify-between">
        <p>
          © {new Date().getFullYear()} lsbstack. Todos los derechos reservados.
        </p>
        <div className="flex items-center gap-3">
          <Link href="#" className="hover:underline">
            Privacidad
          </Link>
          <Link href="#" className="hover:underline">
            Términos
          </Link>
          <Link href="#" className="hover:underline">
            Contacto
          </Link>
        </div>
      </Container>
    </footer>
  );
}
