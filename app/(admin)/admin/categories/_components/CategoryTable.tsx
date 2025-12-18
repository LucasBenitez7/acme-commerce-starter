import Link from "next/link";

import { Button } from "@/components/ui/button";

type CategoryWithCount = {
  id: string;
  name: string;
  slug: string;
  sort: number;
  createdAt: Date;
  _count: { products: number };
};

export function CategoryTable({
  categories,
}: {
  categories: CategoryWithCount[];
}) {
  if (categories.length === 0) {
    return (
      <div className="text-center py-12 text-neutral-500">
        <p className="font-medium">No se encontraron categorías.</p>
        <p className="text-xs mt-1">
          Intenta cambiar los filtros o crear una nueva.
        </p>
      </div>
    );
  }

  return (
    <div className="relative w-full overflow-auto">
      <table className="w-full text-sm text-left">
        <thead className="text-xs uppercase bg-neutral-50 border-b text-neutral-500">
          <tr>
            <th className="px-6 py-3 w-20 text-center">Orden</th>
            <th className="px-6 py-3">Nombre / Slug</th>
            <th className="px-6 py-3 hidden sm:table-cell">Creado</th>
            <th className="px-6 py-3 text-center">Productos</th>
            <th className="px-6 py-3 text-right">Acciones</th>
          </tr>
        </thead>
        <tbody className="divide-y divide-neutral-100">
          {categories.map((cat) => (
            <tr
              key={cat.id}
              className="group hover:bg-neutral-50/50 transition-colors"
            >
              <td className="px-6 py-3 text-center font-mono text-xs text-neutral-400">
                {cat.sort}
              </td>
              <td className="px-6 py-3">
                <div className="font-medium text-neutral-900">{cat.name}</div>
                <div className="text-xs text-neutral-400 font-mono">
                  /{cat.slug}
                </div>
              </td>
              <td className="px-6 py-3 text-xs text-neutral-500 hidden sm:table-cell">
                {new Date(cat.createdAt).toLocaleDateString()}
              </td>
              <td className="px-6 py-3 text-center">
                <span
                  className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium border ${
                    cat._count.products > 0
                      ? "bg-blue-50 text-blue-700 border-blue-100"
                      : "bg-neutral-100 text-neutral-500 border-neutral-200"
                  }`}
                >
                  {cat._count.products}
                </span>
              </td>
              <td className="px-6 py-3 text-right">
                <Button
                  asChild
                  variant="ghost"
                  size="sm"
                  className="h-8 px-2 lg:px-3"
                >
                  <Link href={`/admin/categories/${cat.id}`}>Editar</Link>
                </Button>
              </td>
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  );
}
