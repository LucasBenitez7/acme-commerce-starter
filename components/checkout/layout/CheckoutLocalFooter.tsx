import Link from "next/link";

export function CheckoutLocalFooter() {
  return (
    <footer className="hidden border-t bg-background py-6 px-4 text-xs text-muted-foreground lg:block">
      <div className="flex flex-col gap-2 sm:flex-row sm:items-center sm:justify-between">
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
      </div>
    </footer>
  );
}
