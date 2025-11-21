import Link from "next/link";

import type { ReactNode } from "react";

export const metadata = {
  title: "LSB Admin",
};

export default function AdminLayout({ children }: { children: ReactNode }) {
  return (
    <div>
      <header className="sticky top-0 z-[100] flex h-[var(--header-h)] w-full justify-center items-center border-b bg-background">
        <Link
          href="/"
          type="button"
          className="flex items-center px-2 text-3xl font-semibold focus:outline-none hover:cursor-pointer"
        >
          Logo lsb
        </Link>
      </header>
      <main className="py-6">
        <div className="grid min-h-[60svh] place-items-center content-start mx-auto max-w-7xl px-6 sm:px-8">
          {children}
        </div>
      </main>
    </div>
  );
}
