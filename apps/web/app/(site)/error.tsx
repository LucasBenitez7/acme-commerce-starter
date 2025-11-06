"use client";
import { useEffect } from "react";

export default function Error({
  error,
  reset,
}: {
  error: Error & { digest?: string };
  reset: () => void;
}) {
  useEffect(() => {
    console.error(error);
  }, [error]);

  return (
    <section className="mx-auto max-w-3xl px-6 py-16 text-center">
      <h1 className="text-2xl font-semibold">Algo salió mal</h1>
      <p className="mt-2 text-neutral-600">
        Intenta nuevamente. Si el problema persiste, vuelve más tarde.
      </p>
      <div className="mt-6">
        <button onClick={() => reset()} className="underline">
          Reintentar
        </button>
      </div>
    </section>
  );
}
