"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { useSession, signIn, signOut } from "next-auth/react";
import { useRef, useState } from "react";
import { FaRegUser, FaRegHeart } from "react-icons/fa6";
import { IoSearch } from "react-icons/io5";

import { CartButtonWithSheet } from "@/components/cart/CartButtonWithSheet";
import {
  Sheet,
  SheetContent,
  SheetTitle,
  BurgerButton,
  Button,
} from "@/components/ui";

import { useAutoCloseOnRouteChange } from "@/hooks/use-auto-close-on-route-change";
import { useLockBodyScroll } from "@/hooks/use-lock-body-scroll";
import { useSheetSafety } from "@/hooks/use-sheet-safety";

import { SiteSidebar } from "./SiteSidebar";

import type { CategoryLink } from "@/types/catalog";

const SHEET_ID = "site-sidebar";

export function Header({ categories }: { categories: CategoryLink[] }) {
  const [open, setOpen] = useState(false);
  const [accountMenuOpen, setAccountMenuOpen] = useState(false);

  const safeRef = useRef<HTMLDivElement>(null);
  const pathname = usePathname();

  const { data: session, status: sessionStatus } = useSession();
  const user = session?.user ?? null;
  const isSessionLoading = sessionStatus === "loading";

  const HIDE_HEADER_ON: string[] = ["/checkout"];
  const hideHeader = HIDE_HEADER_ON.includes(pathname);
  const isCartPage = pathname === "/cart";

  useLockBodyScroll(open && !hideHeader);
  useAutoCloseOnRouteChange((open || accountMenuOpen) && !hideHeader, () => {
    setOpen(false);
    setAccountMenuOpen(false);
  });

  const {
    handlePointerLeaveHeader,
    handlePointerLeaveSheet,
    handleAnyNavClickCapture,
    onInteractOutside,
  } = useSheetSafety({ open, setOpen, safeRef, sheetId: SHEET_ID });

  if (hideHeader) {
    return null;
  }

  const logo = (
    <Link
      href="/"
      className="mx-2 flex justify-self-center px-2 text-3xl font-semibold focus:outline-none"
    >
      Logo lsb
    </Link>
  );

  const userInitial =
    typeof user?.name === "string" && user.name.trim() !== ""
      ? user.name.trim().charAt(0).toUpperCase()
      : (user?.email?.charAt(0)?.toUpperCase() ?? null);

  const accountTooltip = isSessionLoading
    ? "Cargando sesión…"
    : user
      ? "Mi cuenta"
      : "Iniciar sesión";

  function handleAccountClick() {
    if (isSessionLoading) return;

    if (!user) {
      // Usuario no logueado → iniciar sesión con GitHub
      void signIn("github", { callbackUrl: "/account" });
      return;
    }

    // Usuario logueado → abrir / cerrar menú
    setAccountMenuOpen((prev) => !prev);
  }

  return (
    <>
      <header
        ref={safeRef}
        onPointerLeave={handlePointerLeaveHeader}
        onClickCapture={handleAnyNavClickCapture}
        className="mx-auto w-full z-[100] sticky top-0 h-[var(--header-h)] grid grid-cols-[1fr_auto_1fr] items-center bg-background border-b px-4"
      >
        <div className="flex justify-self-start items-center h-full content-center">
          <Sheet open={open} onOpenChange={setOpen} modal={false}>
            <BurgerButton
              open={open}
              onToggle={() => setOpen((v) => !v)}
              controlsId={SHEET_ID}
              aria-disabled={open}
            />
            <SheetContent
              id={SHEET_ID}
              side="left"
              className="w-[min(360px,92vw)] sm:w-[360px] lg:w-[400px] outline-none"
              onPointerLeave={handlePointerLeaveSheet}
              onClickCapture={handleAnyNavClickCapture}
              onInteractOutside={onInteractOutside}
              onEscapeKeyDown={() => setOpen(false)}
            >
              <div className="overflow-y-auto h-full focus:outline-none">
                <SheetTitle className="hidden">Menu</SheetTitle>
                <SiteSidebar categories={categories} />
              </div>
            </SheetContent>
          </Sheet>
        </div>

        {/*------------- LOGO ------------- */}
        {logo}
        {/*------------- NAV ------------- */}
        <nav className="justify-self-end h-full flex items-center gap-2 text-sm">
          <div className="hidden sm:flex items-center gap-1 border-b border-neutral-500">
            <IoSearch className="size-[20px]" />
            <input
              type="search"
              placeholder="Buscar"
              className="px-1 outline-none w-[200px]"
            />
          </div>
          <div className="flex gap-1">
            <Button
              type="button"
              variant={"hovers"}
              className="tip-bottom"
              data-tip={accountTooltip}
              aria-label={user ? "Menú de cuenta" : "Iniciar sesión"}
              onClick={handleAccountClick}
            >
              {userInitial ? (
                <span className="flex h-[28px] w-[28px] items-center justify-center rounded-full border border-neutral-400 text-[13px] font-semibold">
                  {userInitial}
                </span>
              ) : (
                <FaRegUser className="size-[20px]" aria-hidden="true" />
              )}
            </Button>

            {user && accountMenuOpen && (
              <div className="absolute right-0 top-full z-[120] mt-2 w-52 rounded-lb border bg-popover text-xs shadow-lg">
                <div className="border-b px-3 py-2 text-[11px] text-muted-foreground">
                  Sesión iniciada como
                  <div className="truncate font-medium text-foreground">
                    {user.name || user.email || "Usuario"}
                  </div>
                </div>

                <nav className="py-1">
                  <Link
                    href="/account"
                    className="block px-3 py-2 text-xs hover:bg-muted"
                    onClick={() => setAccountMenuOpen(false)}
                  >
                    Mi cuenta
                  </Link>
                  <Link
                    href="/account/orders"
                    className="block px-3 py-2 text-xs hover:bg-muted"
                    onClick={() => setAccountMenuOpen(false)}
                  >
                    Mis pedidos
                  </Link>
                  <button
                    type="button"
                    className="block w-full px-3 py-2 text-left text-xs text-destructive hover:bg-muted/80"
                    onClick={() => {
                      setAccountMenuOpen(false);
                      void signOut({ callbackUrl: "/" });
                    }}
                  >
                    Cerrar sesión
                  </button>
                </nav>
              </div>
            )}

            <Button
              asChild
              variant={"hovers"}
              className="tip-bottom"
              data-tip="Favoritos"
            >
              <Link
                href="/favoritos"
                className="flex items-center"
                aria-label="Favoritos"
              >
                <FaRegHeart className="size-[20px]" aria-hidden="true" />
              </Link>
            </Button>

            <div
              style={isCartPage ? { pointerEvents: "none" } : undefined}
              aria-disabled={isCartPage}
              aria-hidden={isCartPage}
            >
              <CartButtonWithSheet />
            </div>
          </div>

          <Button asChild variant={"outline"} className="text-base">
            <Link href="/admin" className="px-4 text-base">
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
