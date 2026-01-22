import { redirect } from "next/navigation";

import { auth } from "@/lib/auth";

import { AdminHeader } from "./_components/AdminHeader";

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
    <div className="flex flex-col min-h-screen bg-neutral-50 font-sans text-foreground">
      <AdminHeader user={session.user} />

      <main className="flex-1 p-4 sm:p-6 lg:p-8 overflow-y-auto">
        {children}
      </main>
    </div>
  );
}
