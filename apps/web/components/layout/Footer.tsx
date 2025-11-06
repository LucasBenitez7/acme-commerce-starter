import Link from "next/link";

import { Container } from "@/components/ui";

export function Footer() {
  return (
    <footer className="border-t">
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
