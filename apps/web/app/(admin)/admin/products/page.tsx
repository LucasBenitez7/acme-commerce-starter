import Image from "next/image";
import Link from "next/link";
import { FaPlus, FaPencil, FaTrash } from "react-icons/fa6";

import {
  Button,
  Card,
  CardContent,
  CardHeader,
  CardTitle,
} from "@/components/ui";

import { formatMinor, parseCurrency } from "@/lib/currency";
import { prisma } from "@/lib/db";

import { deleteProductAction } from "./actions";

export const dynamic = "force-dynamic";

export default async function AdminProductsPage() {
  // 1. Obtenemos productos con sus variantes para calcular stock
  const products = await prisma.product.findMany({
    orderBy: { createdAt: "desc" },
    include: {
      category: true,
      variants: true,
      images: {
        orderBy: { sort: "asc" },
        take: 1,
      },
    },
  });

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <h1 className="text-2xl font-bold tracking-tight">Productos</h1>
        <Button asChild>
          <Link href="/admin/products/new">
            <FaPlus className="mr-2 h-4 w-4" />
            Nuevo Producto
          </Link>
        </Button>
      </div>

      <Card>
        <CardHeader className="px-6 py-4 border-b bg-neutral-50/50">
          <CardTitle className="text-base">
            Catálogo ({products.length})
          </CardTitle>
        </CardHeader>
        <CardContent className="p-0">
          <div className="relative w-full overflow-auto">
            <table className="w-full text-sm text-left">
              <thead className="text-xs text-neutral-500 uppercase bg-neutral-50 border-b">
                <tr>
                  <th className="px-6 py-3 font-medium w-[80px]">Imagen</th>
                  <th className="px-6 py-3 font-medium">Nombre</th>
                  <th className="px-6 py-3 font-medium">Categoría</th>
                  <th className="px-6 py-3 font-medium">Precio</th>
                  <th className="px-6 py-3 font-medium">Stock Total</th>
                  <th className="px-6 py-3 font-medium text-right">Acciones</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-neutral-100">
                {products.length === 0 ? (
                  <tr>
                    <td
                      colSpan={6}
                      className="px-6 py-12 text-center text-neutral-500"
                    >
                      No hay productos registrados.
                    </td>
                  </tr>
                ) : (
                  products.map((product) => {
                    const img =
                      product.images[0]?.url ?? "/og/default-products.jpg";
                    const currency = parseCurrency(product.currency);
                    // Calculamos el stock total sumando las variantes
                    const totalStock = product.variants.reduce(
                      (acc, v) => acc + v.stock,
                      0,
                    );
                    const isOutOfStock = totalStock === 0;

                    return (
                      <tr
                        key={product.id}
                        className="bg-white hover:bg-neutral-50 transition-colors group"
                      >
                        <td className="px-6 py-3">
                          <div className="relative h-10 w-10 rounded overflow-hidden bg-neutral-100 border">
                            <Image
                              src={img}
                              alt={product.name}
                              fill
                              className="object-cover"
                            />
                          </div>
                        </td>
                        <td className="px-6 py-3 font-medium text-neutral-900">
                          {product.name}
                          {isOutOfStock && (
                            <span className="ml-2 inline-flex items-center rounded-full bg-red-100 px-2 py-0.5 text-[10px] font-medium text-red-800">
                              Agotado
                            </span>
                          )}
                        </td>
                        <td className="px-6 py-3 text-neutral-500">
                          {product.category.name}
                        </td>
                        <td className="px-6 py-3 font-medium">
                          {formatMinor(product.priceCents, currency)}
                        </td>
                        <td className="px-6 py-3">
                          <span
                            className={`font-medium ${isOutOfStock ? "text-red-600" : "text-green-600"}`}
                          >
                            {totalStock} u.
                          </span>
                          <span className="text-xs text-muted-foreground ml-1">
                            ({product.variants.length} var.)
                          </span>
                        </td>
                        <td className="px-6 py-3 text-right">
                          <div className="flex justify-end gap-2 opacity-0 group-hover:opacity-100 transition-opacity">
                            <Button
                              asChild
                              variant="ghost"
                              size="icon"
                              className="h-8 w-8"
                            >
                              <Link href={`/admin/products/${product.id}`}>
                                <FaPencil className="h-3.5 w-3.5 text-blue-600" />
                              </Link>
                            </Button>

                            {/* Formulario simple para borrar sin JS cliente complejo */}
                            <form
                              action={async () => {
                                "use server";
                                await deleteProductAction(product.id);
                              }}
                            >
                              <Button
                                type="submit"
                                variant="ghost"
                                size="icon"
                                className="h-8 w-8 hover:bg-red-50 hover:text-red-600"
                              >
                                <FaTrash className="h-3.5 w-3.5" />
                              </Button>
                            </form>
                          </div>
                        </td>
                      </tr>
                    );
                  })
                )}
              </tbody>
            </table>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}
