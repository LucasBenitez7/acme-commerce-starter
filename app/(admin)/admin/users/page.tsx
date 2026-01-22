import { type Metadata } from "next";

import { PaginationNav } from "@/components/catalog/PaginationNav";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";

import { getAdminUsers } from "@/lib/admin/queries";

import { UserListToolbar } from "./_components/UserListToolbar";
import { UserTable } from "./_components/UserTable";

export const metadata: Metadata = {
  title: "Admin | Usuarios",
};

export const dynamic = "force-dynamic";

type Props = {
  searchParams: Promise<{
    q?: string;
    role?: string;
    page?: string;
    sort?: string;
  }>;
};

export default async function AdminUsersPage({ searchParams }: Props) {
  const sp = await searchParams;
  const page = Number(sp.page) || 1;
  const query = sp.q || "";
  const role = sp.role === "admin" || sp.role === "user" ? sp.role : undefined;

  const sort = sp.sort || "createdAt-desc";

  const { users, totalCount, totalPages } = await getAdminUsers({
    page,
    limit: 10,
    query,
    role,
    sort,
  });

  return (
    <div className="space-y-4">
      <div className="flex items-center justify-between">
        <h1 className="text-2xl font-semibold border-b w-full pb-2">
          Clientes / Usuarios
        </h1>
      </div>

      <Card>
        <CardHeader className="p-4 border-b flex flex-col md:flex-row md:items-center justify-between gap-4">
          <CardTitle className="text-lg font-semibold">
            Total <span className="text-base">({totalCount})</span>
          </CardTitle>
          <div className="w-full md:w-auto">
            <UserListToolbar />
          </div>
        </CardHeader>

        <CardContent className="p-0">
          <UserTable users={users} />

          {totalPages > 1 && (
            <div className="py-4 flex justify-end px-4 border-t">
              <PaginationNav totalPages={totalPages} page={page} />
            </div>
          )}
        </CardContent>
      </Card>
    </div>
  );
}
