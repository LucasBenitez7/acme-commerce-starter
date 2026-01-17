"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { signOut } from "next-auth/react";
import {
  FaBoxOpen,
  FaMapLocationDot,
  FaUserGear,
  FaShieldHalved,
  FaRightFromBracket,
  FaHeart,
} from "react-icons/fa6";

import { cn } from "@/lib/utils";

const NAV_ITEMS = [
  {
    label: "Cuenta",
    href: "/account",
    icon: FaUserGear,
    exact: true,
  },
  {
    label: "Direcciones",
    href: "/account/addresses",
    icon: FaMapLocationDot,
  },
  {
    label: "Seguridad",
    href: "/account/security",
    icon: FaShieldHalved,
  },
  {
    label: "Pedidos",
    href: "/account/orders",
    icon: FaBoxOpen,
  },
  {
    label: "Favoritos",
    href: "/account/favorites",
    icon: FaHeart,
  },
];

type Props = {
  user: {
    name?: string | null;
    firstName?: string | null;
    lastName?: string | null;
    email?: string | null;
  };
};

export function AccountSidebar({ user }: Props) {
  const pathname = usePathname();

  return (
    <aside className="w-full sm:w-64 flex sm:flex-col sm:sticky top-20 shrink-0 bg-background border rounded-xs overflow-hidden h-fit">
      {/* NAVEGACIÓN */}
      <nav className="flex flex-col gap-1 p-2 border w-full text-center">
        {NAV_ITEMS.map((item) => {
          const isActive = item.exact
            ? pathname === item.href
            : pathname.startsWith(item.href);

          const Icon = item.icon;

          return (
            <Link
              key={item.href}
              href={item.href}
              className={cn(
                "flex items-center gap-3 px-3 py-2.5 text-sm font-semibold text-center rounded-xs transition-colors justify-center sm:justify-start",
                isActive
                  ? "bg-foreground text-background shadow-sm"
                  : "hover:bg-neutral-100 active:bg-neutral-100",
              )}
            >
              <Icon
                className={cn(
                  "size-4",
                  isActive ? "text-background" : "text-foreground",
                )}
              />
              {item.label}
            </Link>
          );
        })}

        <div className="my-1 border-t border" />
        <button
          onClick={() => signOut({ callbackUrl: "/" })}
          className="flex w-full items-center gap-3 px-3 py-2.5 text-sm font-semibold rounded-xs text-red-600 hover:bg-red-50 transition-colors hover:cursor-pointer  justify-center sm:justify-start"
        >
          <FaRightFromBracket className="size-4" />
          Cerrar sesión
        </button>
      </nav>
    </aside>
  );
}
