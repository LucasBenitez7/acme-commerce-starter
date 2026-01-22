"use client";

import Link from "next/link";
import { useState, useCallback } from "react";
import { CgClose } from "react-icons/cg";
import { RiMenu2Line } from "react-icons/ri";

import { Button } from "@/components/ui/button";
import {
	Sheet,
	SheetContent,
	SheetTrigger,
	SheetTitle,
} from "@/components/ui/sheet";

import { useCloseOnNav } from "@/hooks/common/use-close-on-nav";

import { AdminSidebar } from "./AdminSidebar";

type AdminUser = {
	name?: string | null;
	email?: string | null;
	image?: string | null;
};

type Props = {
	user?: AdminUser;
};

export function AdminHeader({ user }: Props) {
	const [open, setOpen] = useState(false);

	const closeMenu = useCallback(() => {
		setOpen(false);
	}, []);

	useCloseOnNav(closeMenu);

	return (
		<header className="sticky top-0 z-[100] w-full border-b bg-background h-14 grid grid-cols-[1fr_auto_1fr] items-center px-4">
			<div className="flex justify-self-start items-center">
				<Sheet open={open} onOpenChange={setOpen} modal={false}>
					<SheetTrigger asChild>
						<Button variant="ghost" className="relative px-2" aria-label="Menu">
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
					</SheetTrigger>

					<SheetContent
						side="left"
						className="w-full sm:w-[300px] p-0 outline-none border-r"
					>
						<SheetTitle className="hidden">Admin Menu</SheetTitle>
						<AdminSidebar user={user} />
					</SheetContent>
				</Sheet>
			</div>

			{/* CENTRO: Logo */}
			<Link
				href="/"
				className="text-lg font-bold tracking-tight flex items-center gap-2 justify-self-center"
			>
				LSB Admin
			</Link>
		</header>
	);
}
