import Link from "next/link";
import { notFound } from "next/navigation";
import { FaUndo } from "react-icons/fa";
import {
  FaArrowUpRightFromSquare,
  FaBoxOpen,
  FaCartShopping,
  FaLayerGroup,
} from "react-icons/fa6";

import { getProductForEdit } from "@/lib/products/queries";
import { getProductFormDependencies } from "@/lib/products/service";

import { StatCard } from "@/app/(admin)/_components/StatCard";

import { ProductForm } from "../_components/form/ProductForm";
import { ArchiveButton } from "../_components/shared/ArchiveButton";

export default async function EditProductPage({
  params,
}: {
  params: Promise<{ id: string }>;
}) {
  const { id } = await params;

  const [product, formDeps] = await Promise.all([
    getProductForEdit(id),
    getProductFormDependencies(),
  ]);
  if (!product) notFound();

  const totalStock = product.variants.reduce((acc, v) => acc + v.stock, 0);
  const totalVariants = product.variants.length;
  const totalSales = product._count.orderItems;
  const totalReturns = product._count.orderItems;

  return (
    <div className="space-y-6 max-w-5xl mx-auto pb-10">
      {/* --- HEADER --- */}
      <h1 className="text-2xl font-bold border-b pb-1">
        {product?.id ? "Editar Producto" : "Nuevo Producto"}
      </h1>

      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h1 className="text-xl font-semibold flex items-center gap-2">
            {product.name}
            {product.isArchived && (
              <span className="bg-amber-100 px-2 py-0.5 rounded-md text-xs font-medium text-amber-700 border border-amber-200">
                Archivado
              </span>
            )}
          </h1>
        </div>

        {product.isArchived ? (
          <ArchiveButton
            productId={id}
            productName={product.name}
            isArchived={product.isArchived}
          />
        ) : (
          <Link
            href={`/product/${product.slug}`}
            target="_blank"
            className="text-xs fx-underline-anim font-medium w-fit"
          >
            Ver en Tienda
            <span>
              <FaArrowUpRightFromSquare className="size-3.5 inline-block mb-1 ml-2" />
            </span>
          </Link>
        )}
      </div>

      {/* --- STATS --- */}
      <div className="grid grid-cols-1 sm:grid-cols-4 gap-4">
        <StatCard
          label="Stock Total"
          value={`${totalStock} u.`}
          icon={FaBoxOpen}
          subtext={totalStock === 0 ? "Agotado" : "En inventario"}
          trend={totalStock < 5 ? "low" : "normal"}
        />
        <StatCard
          label="Variantes"
          value={totalVariants}
          icon={FaLayerGroup}
          subtext="Colores y tallas"
        />
        <StatCard
          label="Ventas"
          value={totalSales}
          icon={FaCartShopping}
          subtext="Histórico total"
          trend={totalSales > 0 ? "good" : "normal"}
        />
        <StatCard
          label="Reembolsos"
          value={totalReturns}
          icon={FaUndo}
          subtext="Histórico total"
          trend={totalSales > 0 ? "low" : "normal"}
        />
      </div>

      {/* --- FORMULARIO --- */}
      <ProductForm product={product} {...formDeps} />
    </div>
  );
}
