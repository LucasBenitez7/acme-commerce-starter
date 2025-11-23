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

  if (!session?.user) {
    return (
      <main className="container mx-auto max-w-xl py-10">
        <h1 className="mb-4 text-2xl font-semibold">Mi cuenta</h1>
        <p className="mb-4 text-sm text-muted-foreground">
          No has iniciado sesión.
        </p>
        <form
          action={async () => {
            "use server";
            await signIn("github");
          }}
        >
          <button
            type="submit"
            className="rounded-lb border px-4 py-2 text-sm font-medium"
          >
            Iniciar sesión con GitHub
          </button>
        </form>
      </main>
    );
  }

  return (
    <main className="container mx-auto max-w-xl py-10">
      <h1 className="mb-2 text-2xl font-semibold">Mi cuenta</h1>
      <p className="mb-4 text-sm text-muted-foreground">
        Has iniciado sesión como <strong>{session.user.email}</strong>
      </p>

      <pre className="mb-4 rounded-lb bg-muted p-3 text-[11px]">
        {JSON.stringify(session.user, null, 2)}
      </pre>

      <form
        action={async () => {
          "use server";
          await signOut();
        }}
      >
        <button
          type="submit"
          className="rounded-lb border px-4 py-2 text-sm font-medium"
        >
          Cerrar sesión
        </button>
      </form>
    </main>
  );
}
