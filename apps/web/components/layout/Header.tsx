"use client";

import { Heart, Search, UserRound, XIcon } from "lucide-react";
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
    <header className="mx-auto w-full px-6 sm:px-8 z-50 sticky top-0 border-b h-16 grid grid-cols-[1fr_auto_1fr] items-center bg-white/80 backdrop-blur supports-[backdrop-filter]:bg-white/50">
      <div className="justify-self-start">
        <Sheet open={open} onOpenChange={setOpen}>
          {/* Abrir Menu */}
          <SheetTrigger asChild>
            <span
              aria-label="Abrir menú"
              title="Abrir menú"
              className="hover:cursor-pointer"
            >
              <svg
                xmlns="http://www.w3.org/2000/svg"
                width="22px"
                height="22px"
                viewBox="0 0 24 24"
              >
                <path
                  fill="currentColor"
                  d="M3 4h18v2H3zm0 7h12v2H3zm0 7h18v2H3z"
                />
              </svg>
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

      <nav className="justify-self-end flex items-center gap-1 text-base">
        <div className="flex items-center gap-1 border-b border-neutral-500">
          <Search
            className=" 
							size-[22px]
						"
          />
          <input
            type="search"
            placeholder="Buscar"
            className="hover:outline-none active:outline-none focus:outline-none px-1"
          />
        </div>
        <div className="flex items-center p-1 ml-2">
          <Link href="/account">
            <UserRound
              className=" 
								size-[22px]
								focus:outline-none active:outline-none hover:cursor-pointer 
							"
            />
          </Link>
        </div>
        <div className="flex items-center p-1">
          <Link href="/favoritos">
            <Heart size={20} strokeWidth={2} />
          </Link>
        </div>
        <div className="flex items-center p-1">
          <Link href="/cart">
            <svg
              xmlns="http://www.w3.org/2000/svg"
              width="22px"
              height="22px"
              viewBox="0 0 24 24"
            >
              <g
                fill="none"
                stroke="currentColor"
                strokeLinecap="round"
                strokeLinejoin="round"
                strokeWidth="2"
              >
                <path d="M6.331 8H17.67a2 2 0 0 1 1.977 2.304l-1.255 8.152A3 3 0 0 1 15.426 21H8.574a3 3 0 0 1-2.965-2.544l-1.255-8.152A2 2 0 0 1 6.331 8" />
                <path d="M9 11V6a3 3 0 0 1 6 0v5" />
              </g>
            </svg>
          </Link>
        </div>
        <div className="flex items-center p-1">
          <Link href="/admin">Admin</Link>
        </div>
      </nav>
    </header>
  );
}
