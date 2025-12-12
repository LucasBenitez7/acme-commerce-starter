"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { BiSolidCategory } from "react-icons/bi";
import {
  FaChartPie,
  FaClipboardList,
  FaStore,
  FaTags,
  FaUsers,
} from "react-icons/fa6";

import { cn } from "@/lib/utils";

const NAV_ITEMS = [
  {
    label: "Dashboard",
    href: "/admin",
    icon: FaChartPie,
  },
  {
    label: "Pedidos",
    href: "/admin/orders",
    icon: FaClipboardList,
  },
  {
    label: "Categorias",
    href: "/admin/categories",
    icon: BiSolidCategory,
  },
  {
    label: "Productos",
    href: "/admin/products",
    icon: FaTags,
  },

  {
    label: "Clientes-Disabled",
    href: "/admin/users",
    icon: FaUsers,
  },
  {
    label: "Volver a la tienda",
    href: "/",
    icon: FaStore,
    variant: "ghost",
  },
];

export function AdminSidebar() {
  const pathname = usePathname();

  return (
    <aside className="w-64 shrink-0 border-r bg-background hidden md:block min-h-screen">
      <div className="h-16 flex items-center px-4 border-b">
        <Link href="/" className="text-lg font-bold tracking-tight">
          LSB Admin
        </Link>
      </div>

      <nav className="flex flex-col gap-2 p-4">
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
                "flex items-center gap-3 px-2 py-2 text-sm font-medium border border-transparent rounded-xs transition-colors",
                isActive
                  ? "bg-neutral-100 border-border text-foreground"
                  : "text-foreground hover:bg-neutral-100 hover:border-border",
                item.variant === "ghost" && "mt-4 border border-dashed",
              )}
            >
              <Icon className="size-4" />
              {item.label}
            </Link>
          );
        })}
      </nav>
    </aside>
  );
}
