"use client";

import Link from "next/link";
import { useState } from "react";
import { FaRegUser, FaRegHeart } from "react-icons/fa6";
import { HiOutlineShoppingBag } from "react-icons/hi2";
import { IoSearch } from "react-icons/io5";
import { RiMenu2Line, RiCloseLine } from "react-icons/ri";

import {
  Sheet,
  SheetClose,
  SheetContent,
  SheetHeader as SheetHdr,
  SheetTitle,
  SheetTrigger,
} from "@/components/ui";

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
            <RiMenu2Line
              aria-label="Abrir menú"
              title="Abrir menú"
              className="
                size-[21px]
                focus:outline-none 
                active:outline-none 
                hover:cursor-pointer 
                stroke-[0.5px]
              "
            />
          </SheetTrigger>

          <SheetContent
            side="left"
            className="z-[60] w-[min(360px,92vw)] sm:w-[360px] lg:w-[400px] outline-none"
            onPointerOut={handlePointerOut}
            onInteractOutside={() => setOpen(false)}
            onEscapeKeyDown={() => setOpen(false)}
          >
            <div className="overflow-y-auto h-full focus:outline-none">
              <SheetHdr className="flex flex-row justify-between h-16 items-center px-5  border-b">
                <SheetTitle>Categorias</SheetTitle>
                {/* Cerrar Menu */}
                <SheetClose asChild>
                  <RiCloseLine
                    aria-label="Cerrar menú"
                    title="Cerrar menú"
                    className="
											size-[21px]
											focus:outline-none 
                      active:outline-none 
                      hover:cursor-pointer 
                      stroke-[0.5px]
										"
                  />
                </SheetClose>
              </SheetHdr>
              <div>
                <SiteSidebar categories={categories} />
              </div>
            </div>
          </SheetContent>
        </Sheet>
      </div>

      <Link href="/" className="justify-self-center text-2xl font-semibold">
        Logo lsb
      </Link>

      <nav className="justify-self-end flex items-center gap-2 text-base">
        <div className="flex items-center gap-1 border-b border-neutral-500">
          <IoSearch className="size-[22px]" />
          <input
            type="search"
            placeholder="Buscar"
            className="hover:outline-none active:outline-none focus:outline-none px-1 max-lg:w-[100px] w-[200px]"
          />
        </div>
        <div className="flex items-center p-1 ml-2">
          <Link href="/account">
            <FaRegUser
              className=" 
								size-[20px]
								focus:outline-none active:outline-none hover:cursor-pointer 
							"
            />
          </Link>
        </div>
        <div className="flex items-center p-1">
          <Link href="/favoritos">
            <FaRegHeart
              className=" 
								size-[21px]
							"
            />
          </Link>
        </div>
        <div className="flex items-center p-1">
          <Link href="/cart">
            <HiOutlineShoppingBag
              className="
                stroke-2
                size-[21px]
                focus:outline-none active:outline-none hover:cursor-pointer 
              "
            />
          </Link>
        </div>
        <div className="flex items-center p-1">
          <Link href="/admin">Admin</Link>
        </div>
      </nav>
    </header>
  );
}
