import { auth, signIn, signOut } from "@/lib/auth";

export const dynamic = "force-dynamic";
export const revalidate = 0;
export const fetchCache = "force-no-store";
export const runtime = "nodejs";
export const metadata = {
  robots: { index: false, follow: false },
};

export default async function AccountPage() {
  const session = await auth();

  if (!session?.user) return null;

  const name = (session.user.name ?? "").trim() || "Sin nombre";
  const email = (session.user.email ?? "").trim() || "—";

  return (
    <div className="space-y-4">
      <section className="rounded-lb border bg-card p-4 text-sm">
        <h2 className="text-base font-semibold">Datos de la cuenta</h2>
        <dl className="mt-2 space-y-1">
          <div className="flex gap-2">
            <dt className="w-24 shrink-0 text-muted-foreground">Nombre</dt>
            <dd className="font-medium">{name}</dd>
          </div>
          <div className="flex gap-2">
            <dt className="w-24 shrink-0 text-muted-foreground">E-mail</dt>
            <dd className="font-medium">{email}</dd>
          </div>
        </dl>
      </section>

      <section className="rounded-lb border bg-card p-4 text-sm">
        <h2 className="text-base font-semibold">Sesión</h2>
        <p className="text-sm text-muted-foreground">
          Si estás en un ordenador compartido, recuerda cerrar la sesión cuando
          termines.
        </p>

        <form
          action={async () => {
            "use server";
            await signOut();
          }}
        >
          <button
            type="submit"
            className="mt-3 inline-flex items-center rounded-lb border px-3 py-1.5 text-xs font-medium hover:bg-muted"
          >
            Cerrar sesión
          </button>
        </form>
      </section>
    </div>
  );
}
