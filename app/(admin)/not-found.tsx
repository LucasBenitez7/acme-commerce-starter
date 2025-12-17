import Link from "next/link";

import { Button } from "@/components/ui/button";

export default function NotFound() {
  return (
    <div className="flex h-[60vh] flex-col items-center justify-center gap-4 text-center">
      <div className="rounded-full bg-neutral-100 p-6 text-neutral-500">
        <svg
          xmlns="http://www.w3.org/2000/svg"
          width="40"
          height="40"
          viewBox="0 0 24 24"
          fill="none"
          stroke="currentColor"
          strokeWidth="2"
          strokeLinecap="round"
          strokeLinejoin="round"
        >
          <circle cx="11" cy="11" r="8" />
          <path d="m21 21-4.3-4.3" />
        </svg>
      </div>
      <h2 className="text-2xl font-bold tracking-tight">
        Página no encontrada
      </h2>
      <p className="text-muted-foreground">
        El recurso que buscas (pedido, producto o usuario) no existe o ha sido
        eliminado.
      </p>
      <Button asChild className="mt-4">
        <Link href="/admin">Volver al Dashboard</Link>
      </Button>
    </div>
  );
}
