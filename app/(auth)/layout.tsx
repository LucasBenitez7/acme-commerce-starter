import Link from "next/link";
import { type ReactNode } from "react";

export default function AuthLayout({ children }: { children: ReactNode }) {
  return (
    <div className="flex min-h-dvh flex-col bg-neutral-50 font-sans">
      <header className="sticky top-0 z-[40] flex h-[var(--header-h)] w-full items-center border-b bg-background justify-center">
        <Link href="/" className="text-foreground text-2xl font-bold">
          LSB SHOP
        </Link>
      </header>

      <div className="flex-1 flex flex-col p-4">{children}</div>
    </div>
  );
}
