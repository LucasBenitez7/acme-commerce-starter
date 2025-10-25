"use client";

import { Menu, XIcon } from "lucide-react";
import Link from "next/link";
import { useState } from "react";
import { MdShoppingCart } from "react-icons/md";

import { Button } from "@/components/ui/button";
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

// const verBox = "border-2 border-solid border-red-700";

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
    <header className="mx-auto w-full sm:px-6 lg:px-8 sticky top-0 border-b bg-white h-14 grid grid-cols-[1fr_auto_1fr] items-center">
      <div className="justify-self-start">
        <Sheet open={open} onOpenChange={setOpen}>
          {/* Abrir Menu */}
          <SheetTrigger asChild>
            <Button
              variant="ghost"
              className="hover:cursor-pointer"
              aria-label="Abrir menú"
              title="Abrir menú"
            >
              <Menu
                strokeWidth={2.5}
                className=" 
								size-[18px]
								focus:outline-none active:outline-none hover:cursor-pointer 
								"
              />
            </Button>
          </SheetTrigger>

          <SheetContent
            side="left"
            className="z-[60] w-[min(360px,92vw)] sm:w-[360px] lg:w-[400px] outline-none"
            onPointerOut={handlePointerOut}
            onInteractOutside={() => setOpen(false)}
            onEscapeKeyDown={() => setOpen(false)}
          >
            <div className="overflow-y-auto h-full focus:outline-none">
              <SheetHdr className="flex flex-row justify-between h-14 items-center pl-5 pr-2 border-b border-b-neutral-300">
                <SheetTitle>Categorias</SheetTitle>
                {/* Cerrar Menu */}
                <SheetClose asChild>
                  <Button
                    variant="ghost"
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
                  </Button>
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

      <nav className="justify-self-end flex items-center gap-3 text-sm">
        <Link href="/" className="hover:underline">
          Buscar
        </Link>
        <div className="flex items-center gap-1">
          <Link href="/cart" className="hover:underline">
            Carrito
          </Link>
          <MdShoppingCart size={16} />
        </div>
        <Link href="/account" className="hover:underline">
          Cuenta
        </Link>
        <Link href="/admin" className="hover:underline">
          Admin
        </Link>
      </nav>
    </header>
  );
}
