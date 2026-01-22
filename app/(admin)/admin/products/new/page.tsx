import Link from "next/link";
import { FaArrowLeft } from "react-icons/fa6";

import { getProductFormDependencies } from "@/lib/products/service";

import { ProductForm } from "../_components/form/ProductForm";

export default async function NewProductPage() {
	const props = await getProductFormDependencies();

	return (
		<div className="max-w-5xl mx-auto space-y-6">
			<div className="grid grid-cols-[1fr_auto_1fr] items-center border-b gap-2 pb-2">
				<div className="flex justify-start">
					<Link
						href="/admin/products"
						className="hover:bg-neutral-100 p-2 rounded-xs transition-colors"
					>
						<FaArrowLeft className="size-4" />
					</Link>
				</div>

				<div className="flex justify-center">
					<h1 className="text-2xl font-semibold tracking-tight flex-1 text-center">
						Nuevo Producto
					</h1>
				</div>

				<div />
			</div>

			<ProductForm {...props} />
		</div>
	);
}
