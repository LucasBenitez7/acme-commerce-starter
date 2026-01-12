import Link from "next/link";
import { FaBox, FaMapLocationDot, FaUserGear } from "react-icons/fa6";

import { Container } from "@/components/ui";
import { Button } from "@/components/ui/button";

import { auth, signOut } from "@/lib/auth";

export const dynamic = "force-dynamic";

function NavLink({
  href,
  children,
  icon: Icon,
}: {
  href: string;
  children: React.ReactNode;
  icon: any;
}) {
  return (
    <Button
      asChild
      variant="ghost"
      className="justify-start gap-3 w-full text-muted-foreground hover:text-foreground hover:bg-neutral-100"
    >
      <Link href={href}>
        <Icon className="h-4 w-4" />
        {children}
      </Link>
    </Button>
  );
}

export default async function AccountLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  const session = await auth();
  const user = session?.user;

  if (!user) return null;

  const displayName = user.firstName
    ? `${user.firstName} ${user.lastName || ""}`
    : user.name || "Usuario";

  return (
    <Container className="py-8 lg:py-12">
      <div className="flex flex-col lg:flex-row gap-8">
        {/* SIDEBAR DE NAVEGACIÓN */}
        <aside className="lg:w-64 shrink-0 space-y-6">
          <div className="px-4 lg:px-0">
            <h1 className="text-xl font-bold tracking-tight">Mi Cuenta</h1>
            <p className="text-sm text-muted-foreground mt-1">
              Hola,{" "}
              <span className="font-medium text-foreground">{displayName}</span>
            </p>
          </div>

          <nav className="space-y-1">
            <NavLink href="/account" icon={FaUserGear}>
              Perfil
            </NavLink>
            <NavLink href="/account/orders" icon={FaBox}>
              Mis Pedidos
            </NavLink>
            <NavLink href="/account/addresses" icon={FaMapLocationDot}>
              Mis Direcciones
            </NavLink>
          </nav>

          <div className="pt-4 border-t px-4 lg:px-0">
            <form
              action={async () => {
                "use server";
                await signOut({ redirectTo: "/" });
              }}
            >
              <Button
                variant="outline"
                size="sm"
                type="submit"
                className="w-full"
              >
                Cerrar sesión
              </Button>
            </form>
          </div>
        </aside>

        {/* CONTENIDO PRINCIPAL */}
        <main className="flex-1 min-w-0">{children}</main>
      </div>
    </Container>
  );
}
