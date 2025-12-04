import { redirect } from "next/navigation";
import { Toaster } from "sonner";

import { auth } from "@/lib/auth";

import { AdminSidebar } from "./components/AdminSidebar";

export const metadata = {
  title: "Panel de Administración",
  robots: { index: false, follow: false },
};

export default async function AdminLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  const session = await auth();

  if (!session?.user) {
    redirect("/auth/login?redirectTo=/admin");
  }

  if (session.user.role !== "admin") {
    redirect("/");
  }

  return (
    <div className="flex min-h-screen bg-neutral-50 font-sans text-foreground">
      <AdminSidebar />

      <main className="flex-1 flex flex-col min-w-0 overflow-hidden">
        <div className="flex-1 overflow-y-auto p-4 md:p-8">{children}</div>
      </main>

      <Toaster position="top-right" richColors closeButton />
    </div>
  );
}
