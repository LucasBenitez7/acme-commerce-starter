"use client";

import Link from "next/link";
import { usePathname, useRouter } from "next/navigation";
import { useSession, signOut } from "next-auth/react";
import { useRef, useState, useCallback } from "react";
import { CgClose } from "react-icons/cg";
import { FaSignOutAlt } from "react-icons/fa";
import {
  FaRegUser,
  FaRegHeart,
  FaBoxOpen,
  FaUser,
  FaMapLocationDot,
} from "react-icons/fa6";
import { IoSearch } from "react-icons/io5";
import { RiMenu2Line } from "react-icons/ri";

import { CartButtonWithSheet } from "@/components/cart/CartButtonWithSheet";
import { Sheet, SheetContent, SheetTitle, Button } from "@/components/ui";

import { useCloseOnNav } from "@/hooks/common/use-close-on-nav";
import { useMounted } from "@/hooks/common/use-mounted";
import { useCartStore } from "@/store/cart";

import { SiteSidebar } from "./SiteSidebar";

import type { CategoryLink } from "@/lib/categories/types";

const SHEET_ID = "site-sidebar";

export function Header({
  categories,
  maxDiscount,
}: {
  categories: CategoryLink[];
  maxDiscount: number;
}) {
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
  const isCartPage = pathname === "/cart" || pathname === "/checkout/success";
  const isAdmin = user?.role === "admin";

  const closeMenu = useCallback(() => {
    setOpen(false);
  }, []);

  useCloseOnNav(closeMenu);

  // Bloquear scroll cuando el menú está abierto
  if (typeof document !== "undefined") {
    if (open) {
      document.body.style.overflow = "hidden";
    } else {
      document.body.style.overflow = "";
    }
  }

  if (hideHeader) return null;

  const userInitial =
    typeof user?.name === "string" && user.name.trim() !== ""
      ? user.name.trim().charAt(0).toUpperCase()
      : (user?.email?.charAt(0)?.toUpperCase() ?? null);

  const showTooltip = mounted && !isSessionLoading && !user;
  const accountTooltip = showTooltip ? "Iniciar sesión" : undefined;

  const favoritosUrl = user ? `/account/favoritos` : `/auth/login`;

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
    useCartStore.getState().clearCart();
    await signOut({ callbackUrl: "/" });
  }

  const logo = (
    <Link
      href="/"
      className="mx-2 flex justify-self-center px-2 text-3xl font-semibold focus:outline-none"
    >
      Logo lsb
    </Link>
  );

  return (
    <>
      <header
        ref={safeRef}
        className="mx-auto w-full z-[100] sticky top-0 h-[var(--header-h)] grid grid-cols-[1fr_auto_1fr] items-center bg-background border-b px-4"
      >
        <div className="flex justify-self-start items-center h-full content-center">
          {/* MENU TRIGGER */}
          <Button
            variant="ghost"
            className="relative px-2"
            aria-label="Menu"
            aria-controls={SHEET_ID}
            aria-expanded={open}
            onClick={() => setOpen((prev) => !prev)}
          >
            <RiMenu2Line
              className={`size-6 transition-all duration-300 ease-in-out ${
                open ? "scale-0 opacity-0" : "scale-100 opacity-100"
              }`}
            />
            <CgClose
              className={`absolute size-6 transition-all duration-300 ease-in-out ${
                open ? "scale-100 opacity-100" : "scale-0 opacity-0"
              }`}
            />
          </Button>

          <Sheet open={open} onOpenChange={setOpen} modal={false}>
            <SheetContent
              id={SHEET_ID}
              side="left"
              className="w-full sm:w-[360px] lg:w-[400px] outline-none"
              onEscapeKeyDown={() => setOpen(false)}
              onInteractOutside={(e) => e.preventDefault()}
            >
              <div className="overflow-y-auto h-full focus:outline-none">
                <SheetTitle className="hidden">Menu</SheetTitle>
                <SiteSidebar
                  categories={categories}
                  maxDiscount={maxDiscount}
                />
              </div>
            </SheetContent>
          </Sheet>
        </div>

        {/*------------- LOGO ------------- */}
        {logo}

        {/*------------- NAV ------------- */}
        <nav className="justify-self-end h-full flex items-center gap-3 text-sm">
          <div
            className={
              hideHeader
                ? "hidden"
                : "hidden sm:flex items-center gap-1 border-b border-neutral-500"
            }
          >
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
              className={
                hideHeader ? "hidden" : "relative flex items-center h-full"
              }
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
                  <span className="flex h-[24px] pt-[0.5px] w-[24px] items-center justify-center rounded-full border-2 border-foreground text-sm font-bold bg-background">
                    {userInitial}
                  </span>
                ) : (
                  <FaRegUser className="size-[1.375rem]" aria-hidden="true" />
                )}
              </Button>

              {/* MENÚ FLOTANTE */}
              {user && accountMenuOpen && (
                <div className="hidden sm:block absolute right-0 top-[calc(100%-20px)] pt-4 w-72 z-[100] animate-in fade-in zoom-in-95 duration-200">
                  <div className="rounded-xs border bg-popover shadow-xl overflow-hidden px-2">
                    {/* Cabecera del menú */}
                    <div className="p-4 border-b flex items-center gap-3">
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
                    <div className="space-y-1 py-2">
                      <Link
                        href="/account"
                        className="flex items-center gap-2 p-2.5 text-sm font-medium rounded-xs hover:bg-neutral-100 active:bg-neutral-100 transition-colors text-foreground hover:text-foreground"
                        onClick={() => setAccountMenuOpen(false)}
                      >
                        <FaUser className="size-4 text-foreground" />
                        Mi cuenta
                      </Link>
                      <Link
                        href="/account/orders"
                        className="flex items-center gap-2 p-2.5 text-sm font-medium rounded-xs hover:bg-neutral-100 active:bg-neutral-100 transition-colors text-foreground hover:text-foreground"
                        onClick={() => setAccountMenuOpen(false)}
                      >
                        <FaBoxOpen className="size-4 text-foreground" />
                        Mis pedidos
                      </Link>
                      <Link
                        href="/account/addresses"
                        className="flex items-center gap-2 p-2.5 text-sm font-medium rounded-xs hover:bg-neutral-100 active:bg-neutral-100 transition-colors text-foreground hover:text-foreground"
                        onClick={() => setAccountMenuOpen(false)}
                      >
                        <FaMapLocationDot className="size-4 text-foreground" />
                        Mis Direcciones
                      </Link>
                    </div>

                    {/* Footer acciones */}
                    <div className="py-2 border-t">
                      <button
                        type="button"
                        onClick={handleSignOut}
                        className="flex w-full hover:cursor-pointer items-center gap-3 p-2.5 text-sm font-medium rounded-xs text-red-600 hover:bg-red-50 active:bg-red-50 transition-colors"
                      >
                        <FaSignOutAlt className="size-4" />
                        Cerrar sesión
                      </button>
                    </div>
                  </div>
                </div>
              )}
            </div>

            <div>
              <Link
                href={favoritosUrl}
                className="relative tip-bottom items-center rounded-xs p-2.5 hover:bg-neutral-100 active:bg-neutral-100 transition-colors text-foreground"
                data-tip="Favoritos"
                aria-label="Favoritos"
              >
                <FaRegHeart className="size-5 text-foreground" />
              </Link>
            </div>

            <div
              style={isCartPage ? { pointerEvents: "none" } : undefined}
              aria-disabled={isCartPage}
              aria-hidden={isCartPage}
              className={isCartPage ? "hidden" : ""}
            >
              <CartButtonWithSheet />
            </div>
          </div>

          {isAdmin && (
            <Button asChild variant={"default"} className="text-base">
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
                  ? "opacity-40 motion-safe:transition-opacity duration-400 ease-out pointer-events-auto"
                  : "opacity-0 motion-safe:transition-opacity duration-200 ease-out pointer-events-none"
              }`}
      ></div>
    </>
  );
}
