"use client";

import { Menu, XIcon } from "lucide-react";
import Link from "next/link";
import { useState } from "react";

import {
  Sheet,
  SheetClose,
  SheetContent,
  SheetHeader as SheetHdr,
  SheetTitle,
  SheetTrigger,
} from "@/components/ui/sheet";

import SiteSidebar from "./SiteSidebar";

export type Cat = { slug: string; label: string };

export default function Header({ categories }: { categories: Cat[] }) {
  const [open, setOpen] = useState(false);

  const handlePointerOut: React.PointerEventHandler<HTMLDivElement> = (e) => {
    if (e.pointerType !== "mouse") return;
    const contentEl = e.currentTarget;
    const rt = e.relatedTarget as Node | null;

    if (!rt) return;

    if (contentEl.contains(rt)) return;

    if (document.contains(rt)) setOpen(false);
  };

  return (
    <header className="mx-auto w-full px-6 sm:px-8 z-50 sticky top-0 border-b h-14 grid grid-cols-[1fr_auto_1fr] items-center bg-white/80 backdrop-blur supports-[backdrop-filter]:bg-white/50">
      <div className="justify-self-start">
        <Sheet open={open} onOpenChange={setOpen}>
          {/* Abrir Menu */}
          <SheetTrigger asChild>
            <span
              aria-label="Abrir menú"
              title="Abrir menú"
              className="hover:cursor-pointer"
            >
              <Menu
                strokeWidth={2.5}
                className=" 
								size-[18px]
								focus:outline-none active:outline-none hover:cursor-pointer 
								"
              />
            </span>
          </SheetTrigger>

          <SheetContent
            side="left"
            className="z-[60] w-[min(360px,92vw)] sm:w-[360px] lg:w-[400px] outline-none"
            onPointerOut={handlePointerOut}
            onInteractOutside={() => setOpen(false)}
            onEscapeKeyDown={() => setOpen(false)}
          >
            <div className="overflow-y-auto h-full focus:outline-none">
              <SheetHdr className="flex flex-row justify-between h-14 items-center px-5  border-b">
                <SheetTitle>Categorias</SheetTitle>
                {/* Cerrar Menu */}
                <SheetClose asChild>
                  <span
                    className="hover:cursor-pointer"
                    aria-label="Cerrar menú"
                    title="Cerrar menú"
                  >
                    <XIcon
                      strokeWidth={2.5}
                      className="
											size-[18px]
											focus:outline-none active:outline-none hover:cursor-pointer 
											"
                    />
                  </span>
                </SheetClose>
              </SheetHdr>
              <div>
                <SiteSidebar categories={categories} />
              </div>
            </div>
          </SheetContent>
        </Sheet>
      </div>

      <Link
        href="/"
        className="justify-self-center font-semibold tracking-tight"
      >
        Logo + lsbstack • shop
      </Link>

      <nav className="justify-self-end flex items-center gap-5 text-sm">
        <div className="flex items-center gap-1 hover:border-b border-neutral-500 py-1">
          <Link href="/">Buscar</Link>
        </div>

        <div className="flex items-center gap-1 hover:border-b border-neutral-500 py-1">
          <Link href="/account">Mi Cuenta</Link>
        </div>
        <div className="flex items-center gap-1 hover:border-b border-neutral-500 py-1">
          <Link href="/cart">Cesta (1)</Link>
        </div>
        <div className="flex items-center gap-1 hover:border-b border-neutral-500 py-1">
          <Link href="/admin">Admin</Link>
        </div>
      </nav>
    </header>
  );
}
