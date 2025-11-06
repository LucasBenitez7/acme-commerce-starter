import Link from "next/link";

export default function NotFound() {
  return (
    <section className="mx-auto max-w-3xl px-6 py-16 text-center">
      <h1 className="text-2xl font-semibold">404 — No encontrado</h1>
      <p className="mt-2 text-neutral-600">No pudimos encontrar esa ruta.</p>
      <div className="mt-6">
        <Link href="/" className="underline">
          Ir al inicio
        </Link>
      </div>
    </section>
  );
}
