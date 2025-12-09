import Link from "next/link";
import { FaPlus, FaPencil, FaTrash } from "react-icons/fa6";

import {
  Button,
  Card,
  CardContent,
  CardHeader,
  CardTitle,
} from "@/components/ui";

import { prisma } from "@/lib/db";

import { DeleteCategoryButton } from "@/app/(admin)/admin/categories/DeleteCategoryButton";

export const dynamic = "force-dynamic";

export default async function AdminCategoriesPage() {
  const categories = await prisma.category.findMany({
    orderBy: { sort: "asc" },
    include: {
      _count: { select: { products: true } }, // Contamos productos
    },
  });

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <h1 className="text-2xl font-bold tracking-tight">Categorías</h1>
        <Button asChild>
          <Link href="/admin/categories/new">
            <FaPlus className="mr-2" /> Nueva
          </Link>
        </Button>
      </div>

      <Card>
        <CardHeader className="px-6 py-4 border-b bg-neutral-50/50">
          <CardTitle className="text-base">Estructura del Menú</CardTitle>
        </CardHeader>
        <CardContent className="p-0">
          <table className="w-full text-sm text-left">
            <thead className="text-xs text-neutral-500 uppercase bg-neutral-50 border-b">
              <tr>
                <th className="px-6 py-3 w-16">Ord.</th>
                <th className="px-6 py-3">Nombre</th>
                <th className="px-6 py-3">Slug</th>
                <th className="px-6 py-3">Productos</th>
                <th className="px-6 py-3 text-right">Acciones</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-neutral-100">
              {categories.map((cat) => (
                <tr key={cat.id} className="bg-white hover:bg-neutral-50">
                  <td className="px-6 py-3 font-mono text-xs">{cat.sort}</td>
                  <td className="px-6 py-3 font-medium">{cat.name}</td>
                  <td className="px-6 py-3 text-neutral-500">{cat.slug}</td>
                  <td className="px-6 py-3">
                    <span className="inline-flex items-center px-2 py-0.5 rounded-full text-xs font-medium bg-blue-50 text-blue-700">
                      {cat._count.products}
                    </span>
                  </td>
                  <td className="px-6 py-3 text-right">
                    <div className="flex justify-end gap-2">
                      <Button
                        asChild
                        variant="ghost"
                        size="icon"
                        className="h-8 w-8"
                      >
                        <Link href={`/admin/categories/${cat.id}`}>
                          <FaPencil className="h-3.5 w-3.5 text-blue-600" />
                        </Link>
                      </Button>
                      <DeleteCategoryButton
                        id={cat.id}
                        hasProducts={cat._count.products > 0}
                      />
                    </div>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </CardContent>
      </Card>
    </div>
  );
}
