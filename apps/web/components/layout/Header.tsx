"use client";

import Link from "next/link";
import { usePathname, useSearchParams } from "next/navigation";
import { useEffect, useRef, useState } from "react";
import { FaRegUser, FaRegHeart } from "react-icons/fa6";
import { HiOutlineShoppingBag } from "react-icons/hi2";
import { IoSearch } from "react-icons/io5";

import {
  Sheet,
  SheetContent,
  SheetTitle,
  BurgerButton,
  Button,
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

  function inSafeZone(node: Element | null) {
    const headerEl = safeRef.current;
    const sheetEl = document.getElementById("site-sidebar");
    return !!(node && (headerEl?.contains(node) || sheetEl?.contains(node)));
  }

  function closeIfOutside(x: number, y: number, related?: EventTarget | null) {
    if (!open) return;
    if (!related) return;

    const el = document.elementFromPoint(x, y) as Element | null;

    if (!el) return;
    if (inSafeZone(el)) return;

    setOpen(false);
  }

  const handlePointerLeaveHeader: React.PointerEventHandler<HTMLElement> = (
    e,
  ) => {
    if (e.pointerType !== "mouse") return;

    closeIfOutside(e.clientX, e.clientY, e.relatedTarget);
  };

  const handlePointerLeaveSheet: React.PointerEventHandler<HTMLDivElement> = (
    e,
  ) => {
    if (e.pointerType !== "mouse") return;

    closeIfOutside(e.clientX, e.clientY, e.relatedTarget);
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
        className="mx-auto w-full z-[80] sticky top-0 h-[4rem] grid grid-cols-[auto_1fr] items-center bg-white px-6"
      >
        <div className="flex items-center h-full content-center">
          <Sheet open={open} onOpenChange={setOpen} modal={false}>
            <BurgerButton
              open={open}
              onToggle={() => setOpen((v) => !v)}
              controlsId="site-sidebar"
              className=""
            />

            {/* Sidebar Content*/}
            <SheetContent
              id="site-sidebar"
              side="left"
              className="w-[min(360px,92vw)] sm:w-[360px] lg:w-[400px] outline-none"
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
                <SheetTitle className="hidden">Menu</SheetTitle>
                <SiteSidebar categories={categories} />
              </div>
            </SheetContent>
          </Sheet>

          {/*------------- LOGO ------------- */}

          <Link
            href="/"
            className="focus:outline-none mx-4 px-2 text-3xl font-semibold"
          >
            Logo lsb
          </Link>
        </div>

        {/*------------- NAV ------------- */}
        <nav className="justify-self-end h-full flex items-center gap-1 text-base">
          <div className="hidden sm:flex items-center gap-1 mx-2 border-b border-neutral-500">
            <IoSearch className="size-[20px]" />
            <input
              type="search"
              placeholder="Buscar"
              className="px-1 outline-none w-[200px]"
            />
          </div>

          <Button asChild variant={"hovers"}>
            <Link href="/account" className="flex items-center px-1 py-[6px]">
              <FaRegUser className="size-[20px]" />
            </Link>
          </Button>
          <Button asChild variant={"hovers"}>
            <Link href="/favoritos" className="flex items-center px-1 py-[6px]">
              <FaRegHeart className="size-[20px]" />
            </Link>
          </Button>
          <Button asChild variant={"hovers"}>
            <Link href="/cart" className="flex items-center px-1 py-[6px]">
              <HiOutlineShoppingBag className="stroke-2 size-[20px]" />
            </Link>
          </Button>

          <Button asChild variant={"outline"} className="text-base">
            <Link href="/admin" className="px-3 text-base">
              Admin
            </Link>
          </Button>
        </nav>
      </header>
      <div
        aria-hidden="true"
        onClick={() => open && setOpen(false)}
        className={`fixed inset-x-0 bottom-0 top-[var(--header-h)] z-[70] bg-black print:hidden
              ${
                open
                  ? "opacity-30 motion-safe:transition-opacity duration-400 ease-out pointer-events-auto"
                  : "opacity-0 motion-safe:transition-opacity duration-200 ease-out pointer-events-none"
              }`}
      ></div>
    </>
  );
}
