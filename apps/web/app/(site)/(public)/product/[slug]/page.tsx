// app/(site)/(public)/product/[slug]/page.tsx
import type { Metadata } from "next";
import { Container } from "@/components/ui/container";

// Si mantienes SP aquí, mejor muévelo a un archivo compartido (ver nota abajo)
export type SP = Promise<Record<string, string | string[] | undefined>>;

export async function generateMetadata({
	params,
}: {
	params: Promise<{ slug: string }>;
}): Promise<Metadata> {
	const { slug } = await params;
	return {
		title: `Producto ${slug}`,
		alternates: {
			canonical: `/product/${encodeURIComponent(slug)}`, // se resuelve absoluta con metadataBase
		},
	};
}

export default async function ProductPage({
	params,
	// Si necesitas QS (ej: ?ref=..), descomenta:
	// searchParams,
}: {
	params: Promise<{ slug: string }>;
	// searchParams: SP;
}) {
	const { slug } = await params;
	// Si esperas IDs numéricos:
	// const id = Number(slug);
	// if (!Number.isFinite(id)) notFound();

	return (
		<Container>
			<h1 className="text-xl font-semibold">
				Producto: {decodeURIComponent(slug)}
			</h1>
			<p className="mt-2 text-neutral-600">
				Detalle del producto (placeholder).
			</p>
		</Container>
	);
}
