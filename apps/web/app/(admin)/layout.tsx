// apps/web/app/(admin)/layout.tsx
import type { ReactNode } from "react";

export default function AdminLayout({ children }: { children: ReactNode }) {
	return (
		<div className="min-h-dvh grid grid-rows-[auto,1fr] bg-neutral-900 text-neutral-100">
			<header className="border-b border-neutral-800">
				<div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8 h-12 flex items-center">
					<h1 className="text-sm font-medium tracking-wide">LSB Admin</h1>
				</div>
			</header>

			<main className="py-6">
				<div className="grid min-h-[60svh] place-items-center content-start mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">{children}</div>
			</main>
		</div>
	);
}
