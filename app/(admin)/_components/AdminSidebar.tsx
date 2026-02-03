"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { signOut } from "next-auth/react";
import { BiSolidCategory } from "react-icons/bi";
import { FaSignOutAlt } from "react-icons/fa";
import {
  FaChartPie,
  FaClipboardList,
  FaStore,
  FaTags,
  FaUsers,
  FaUserShield,
} from "react-icons/fa6";

import { Button } from "@/components/ui/button";

import { cn } from "@/lib/utils";

const NAV_ITEMS = [
  { label: "Dashboard", href: "/admin", icon: FaChartPie },
  { label: "Pedidos", href: "/admin/orders", icon: FaClipboardList },
  { label: "Categorias", href: "/admin/categories", icon: BiSolidCategory },
  { label: "Productos", href: "/admin/products", icon: FaTags },
  { label: "Clientes", href: "/admin/users", icon: FaUsers },
];

type AdminUser = {
  name?: string | null;
  email?: string | null;
  image?: string | null;
};

type Props = {
  user?: AdminUser;
};

export function AdminSidebar({ user }: Props) {
  const pathname = usePathname();

  async function handleSignOut() {
    await signOut({ callbackUrl: "/" });
  }

  const getAdminName = () => {
    if (!user?.name) return "Admin";
    const parts = user.name.trim().split(/\s+/);
    if (parts.length >= 4) return `${parts[0]} ${parts[2]}`;
    return `${parts[0]} ${parts[1] || ""}`.trim();
  };

  return (
    <div className="flex flex-col h-full px-3">
      <div className="flex items-center gap-3 shrink-0">
        <h1 className="pl-2.5 my-4 w-full flex items-center gap-2 text-xl font-bold">
          <FaUserShield className="size-5" />
          {getAdminName()}
        </h1>
      </div>

      <nav className="flex flex-col gap-2 flex-1 overflow-y-auto">
        {NAV_ITEMS.map((item) => {
          const isActive =
            item.href === "/admin"
              ? pathname === "/admin"
              : pathname.startsWith(item.href) && item.href !== "/";
          const Icon = item.icon;

          return (
            <Link
              key={item.href}
              href={item.href}
              className={cn(
                "flex items-center gap-3 px-2 py-2 text-sm font-medium rounded-xs transition-colors",
                isActive
                  ? "bg-foreground text-background"
                  : "text-foreground hover:bg-neutral-100 active:bg-neutral-100",
              )}
            >
              <Icon className="size-4" />
              {item.label}
            </Link>
          );
        })}

        <div className="pt-2 border-t flex flex-col space-y-1">
          <Button
            variant={"ghost"}
            className="text-left justify-start flex w-full pl-2"
            asChild
          >
            <Link href="/catalogo">
              <FaStore className="size-4 mr-2" />
              Volver a la tienda
            </Link>
          </Button>

          <button
            type="button"
            onClick={handleSignOut}
            className="flex w-full hover:cursor-pointer items-center gap-3 p-2.5 text-sm font-medium rounded-xs text-red-600 hover:bg-red-50 active:bg-red-50 transition-colors"
          >
            <FaSignOutAlt className="size-4" />
            Cerrar sesión
          </button>
        </div>
      </nav>
    </div>
  );
}
