"use client";

import Link from "next/link";
import { usePathname, useSearchParams } from "next/navigation";
import { useEffect, useRef, useState } from "react";
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

import useLockBodyScroll from "@/hooks/use-lock-body-scroll";

import SiteSidebar from "./SiteSidebar";

export type Cat = { slug: string; label: string };

export default function Header({ categories }: { categories: Cat[] }) {
  const [open, setOpen] = useState(false);
  const safeRef = useRef<HTMLDivElement>(null);
  const pathname = usePathname();
  const search = useSearchParams();

  useEffect(() => {
    setOpen(false);
  }, [pathname, search?.toString()]);

  useLockBodyScroll(open);

  const handlePointerLeaveHeader: React.PointerEventHandler<HTMLElement> = (
    e,
  ) => {
    if (e.pointerType !== "mouse") return;

    const el = document.elementFromPoint(
      e.clientX,
      e.clientY,
    ) as Element | null;
    const sheetEl = document.getElementById("site-sidebar");
    const headerEl = safeRef.current;

    // Si no hay elemento o no estamos sobre header ni sheet → cerrar
    if (!el) {
      setOpen(false);
      return;
    }

    // Si seguimos dentro del header (o algún hijo), no cierres
    if (headerEl && headerEl.contains(el)) return;

    // Si entramos al sidebar, no cierres
    if (sheetEl && sheetEl.contains(el)) return;

    // En cualquier otro sitio (overlay/body, fuera de header y sheet) → cerrar
    setOpen(false);
  };

  const handlePointerLeaveSheet: React.PointerEventHandler<HTMLDivElement> = (
    e,
  ) => {
    if (e.pointerType !== "mouse") return;

    const el = document.elementFromPoint(
      e.clientX,
      e.clientY,
    ) as Element | null;
    const contentEl = e.currentTarget as HTMLElement;
    if (el && contentEl.contains(el)) return;
    if (el && safeRef.current && safeRef.current.contains(el)) return;

    setOpen(false);
  };

  const handleAnyNavClickCapture: React.MouseEventHandler<HTMLElement> = (
    e,
  ) => {
    const target = e.target as HTMLElement | null;
    const anchor = target?.closest<HTMLAnchorElement>("a[href]");
    if (!anchor) return;
    if (anchor.getAttribute("target") === "_blank") return;
    if (anchor.dataset.keepOpen === "true") return;
    setOpen(false);
  };

  return (
    <>
      <header
        ref={safeRef}
        onPointerLeave={handlePointerLeaveHeader}
        onClickCapture={handleAnyNavClickCapture}
        className="mx-auto w-full z-[80] sticky top-0 border-b h-16 grid grid-cols-[auto_1fr] px-6 items-center bg-white"
      >
        <div className="flex items-center h-full content-center">
          <Sheet open={open} onOpenChange={setOpen} modal={false}>
            {/* Abrir Menu */}
            <SheetTrigger asChild>
              <button
                type="button"
                aria-label="Abrir menú"
                aria-expanded={open}
                aria-controls="site-sidebar"
                className="inline-flex items-center justify-center focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring transition-transform hover:cursor-pointer"
              >
                <RiMenu2Line className="size-[20px]" />
              </button>
            </SheetTrigger>

            {/* Sidebar Content*/}
            <SheetContent
              id="site-sidebar"
              side="left"
              className="w-[min(360px,92vw)] sm:w-[360px] lg:w-[400px] outline-none top-16"
              onPointerLeave={handlePointerLeaveSheet}
              onClickCapture={handleAnyNavClickCapture}
              onInteractOutside={(e) => {
                const t = e.target as Node | null;
                if (t && safeRef.current?.contains(t)) {
                  e.preventDefault();
                  return;
                }
                setOpen(false);
              }}
              onEscapeKeyDown={() => setOpen(false)}
            >
              <div className="overflow-y-auto h-full focus:outline-none">
                <div className="flex flex-col text-2xl py-4 space-y-4 pl-6">
                  <SheetTitle>Novedaddes</SheetTitle>
                  <SheetTitle>Promociones</SheetTitle>
                </div>
                <SiteSidebar categories={categories} />
              </div>
            </SheetContent>
          </Sheet>

          {/*------------- LOGO ------------- */}
          <Link href="/" className="px-6 text-2xl font-semibold">
            Logo lsb
          </Link>
        </div>

        <div className="items-center bg-white h-full content-center">
          {/*------------- NAV ------------- */}
          <nav className="justify-self-end flex items-center gap-2 text-base">
            <div className="flex items-center gap-1 border-b border-neutral-500">
              <IoSearch className="size-[20px]" />
              <input
                type="search"
                placeholder="Buscar"
                className="hover:outline-none active:outline-none focus:outline-none px-1 max-lg:w-[100px] w-[200px]"
              />
            </div>

            <Link href="/account" className="flex items-center p-1 ml-2">
              <FaRegUser className="size-[20px]" />
            </Link>
            <Link href="/favoritos" className="flex items-center p-1">
              <FaRegHeart className="size-[20px]" />
            </Link>
            <Link href="/cart" className="flex items-center p-1">
              <HiOutlineShoppingBag className="stroke-2 size-[20px]" />
            </Link>

            <div className="flex items-center p-1">
              <Link href="/admin">Admin</Link>
            </div>
          </nav>
        </div>
      </header>
      {open && (
        <>
          {/* Overlay principal: todo el viewport debajo del header */}
          <div
            onClick={() => setOpen(false)}
            className="fixed inset-x-0 bottom-0 top-16 bg-black/25"
          />
        </>
      )}
    </>
  );
}
