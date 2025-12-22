"use client";

import Link from "next/link";
import { usePathname, useRouter } from "next/navigation";
import { useSession, signOut } from "next-auth/react";
import { useRef, useState } from "react";
import { FaSignOutAlt } from "react-icons/fa";
import { FaRegUser, FaHeart, FaBoxOpen, FaUser } from "react-icons/fa6";
import { IoSearch } from "react-icons/io5";

import { CartButtonWithSheet } from "@/components/cart/CartButtonWithSheet";
import {
  Sheet,
  SheetContent,
  SheetTitle,
  BurgerButton,
  Button,
} from "@/components/ui";

import { useMounted } from "@/hooks/common/use-mounted";
import { useSheetSafety } from "@/hooks/use-sheet-safety";

import { SiteSidebar } from "./SiteSidebar";

import type { CategoryLink } from "@/lib/categories/queries";

const SHEET_ID = "site-sidebar";

export function Header({ categories }: { categories: CategoryLink[] }) {
  const [open, setOpen] = useState(false);
  const [accountMenuOpen, setAccountMenuOpen] = useState(false);

  const safeRef = useRef<HTMLDivElement>(null);
  const pathname = usePathname();
  const router = useRouter();
  const mounted = useMounted();

  const { data: session, status: sessionStatus } = useSession();
  const user = session?.user ?? null;
  const isSessionLoading = sessionStatus === "loading";

  const HIDE_HEADER_ON: string[] = ["/checkout"];
  const hideHeader = HIDE_HEADER_ON.includes(pathname);
  const isCartPage = pathname === "/cart";
  const isAdmin = user?.role === "admin";

  const {
    handlePointerLeaveHeader,
    handlePointerLeaveSheet,
    handleAnyNavClickCapture,
    onInteractOutside,
  } = useSheetSafety({ open, setOpen, safeRef, sheetId: SHEET_ID });

  if (hideHeader) return null;

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

  const showTooltip = mounted && !isSessionLoading && !user;
  const accountTooltip = showTooltip ? "Iniciar sesión" : undefined;

  function handleAccountClick() {
    if (isSessionLoading) return;

    if (!user) {
      router.push("/auth/login");
      return;
    }

    router.push("/account");
    setAccountMenuOpen(false);
  }

  async function handleSignOut() {
    setAccountMenuOpen(false);
    if (typeof window !== "undefined") {
      window.localStorage.removeItem("cart.v1");
      document.cookie =
        "cart.v1=; Path=/; Expires=Thu, 01 Jan 1970 00:00:01 GMT;";
    }
    await signOut({ callbackUrl: "/" });
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
        <nav className="justify-self-end h-full flex items-center gap-3 text-sm">
          <div className="hidden sm:flex items-center gap-1 border-b border-neutral-500">
            <IoSearch className="size-[20px]" />
            <input
              type="search"
              placeholder="Buscar"
              className="px-1 outline-none w-[200px]"
            />
          </div>

          <div className="flex gap-1 relative items-center h-full">
            {/* WRAPPER para Hover en Desktop */}
            <div
              className="relative flex items-center h-full"
              onMouseEnter={() => {
                if (user) setAccountMenuOpen(true);
              }}
              onMouseLeave={() => setAccountMenuOpen(false)}
            >
              <Button
                type="button"
                variant={"ghost"}
                className={`${
                  showTooltip ? "tip-bottom" : ""
                } hover:cursor-pointer relative z-20`}
                data-tip={accountTooltip}
                aria-label={user ? "Mi cuenta" : "Iniciar sesión"}
                onClick={handleAccountClick}
                size={"icon-lg"}
              >
                {userInitial ? (
                  <span className="flex h-[24px] pt-[0.5px] w-[24px] items-center justify-center rounded-full border-2 border-foreground text-[14px] font-semibold bg-background">
                    {userInitial}
                  </span>
                ) : (
                  <FaRegUser className="size-[1.375rem]" aria-hidden="true" />
                )}
              </Button>

              {/* MENÚ FLOTANTE */}
              {user && accountMenuOpen && (
                <div className="hidden sm:block absolute right-0 top-[calc(100%-20px)] pt-4 w-72 z-[100] animate-in fade-in zoom-in-95 duration-200">
                  <div className="rounded-xs border bg-popover shadow-xl overflow-hidden">
                    {/* Cabecera del menú */}
                    <div className="bg-muted/30 p-4 border-b flex items-center gap-3">
                      <div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-full bg-primary/10 text-primary font-bold text-lg">
                        {userInitial}
                      </div>
                      <div className="flex-1 overflow-hidden">
                        <p className="text-sm font-semibold truncate text-foreground">
                          {user.name || "Usuario"}
                        </p>
                        <p className="text-xs text-muted-foreground truncate">
                          {user.email}
                        </p>
                      </div>
                    </div>

                    {/* Opciones de navegación */}
                    <div className="p-2 space-y-1">
                      <Link
                        href="/account"
                        className="flex items-center gap-3 px-3 py-2.5 text-sm font-medium rounded-xs hover:bg-neutral-100 transition-colors text-foreground/80 hover:text-foreground"
                        onClick={() => setAccountMenuOpen(false)}
                      >
                        <FaUser className="size-4 text-muted-foreground" />
                        Mi cuenta
                      </Link>
                      <Link
                        href="/account/orders"
                        className="flex items-center gap-3 px-3 py-2.5 text-sm font-medium rounded-xs hover:bg-neutral-100 transition-colors text-foreground/80 hover:text-foreground"
                        onClick={() => setAccountMenuOpen(false)}
                      >
                        <FaBoxOpen className="size-4 text-muted-foreground" />
                        Mis pedidos
                      </Link>
                      <Link
                        href="/favoritos"
                        className="flex items-center gap-3 px-3 py-2.5 text-sm font-medium rounded-xs hover:bg-neutral-100 transition-colors text-foreground/80 hover:text-foreground"
                        onClick={() => setAccountMenuOpen(false)}
                      >
                        <FaHeart className="size-4 text-muted-foreground" />
                        Mis favoritos
                      </Link>
                    </div>

                    {/* Footer acciones */}
                    <div className="p-2 border-t bg-muted/10">
                      <button
                        type="button"
                        onClick={handleSignOut}
                        className="flex w-full hover:cursor-pointer items-center gap-3 px-3 py-2.5 text-sm font-medium rounded-xs text-red-600 hover:bg-red-50 transition-colors"
                      >
                        <FaSignOutAlt className="size-4" />
                        Cerrar sesión
                      </button>
                    </div>
                  </div>
                </div>
              )}
            </div>

            <div
              style={isCartPage ? { pointerEvents: "none" } : undefined}
              aria-disabled={isCartPage}
              aria-hidden={isCartPage}
            >
              <CartButtonWithSheet />
            </div>
          </div>

          {isAdmin && (
            <Button asChild variant={"outline"} className="text-base">
              <Link href="/admin" className="px-4 text-base">
                Admin
              </Link>
            </Button>
          )}
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
