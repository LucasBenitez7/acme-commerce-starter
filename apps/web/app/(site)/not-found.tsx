import Link from "next/link";

export default function NotFound() {
  return (
    <section className="mx-auto max-w-6xl px-6 py-16 text-center">
      <h1 className="text-2xl font-semibold">Página no encontrada</h1>
      <p className="mt-2 text-neutral-600">
        Puede que el enlace esté roto o la página haya sido movida.
      </p>
      <div className="mt-6 flex items-center justify-center gap-3">
        <Link href="/" className="underline">
          Volver al inicio
        </Link>
        <span>·</span>
        <Link href="/catalogo" className="underline">
          Ir al catálogo
        </Link>
      </div>
    </section>
  );
}
