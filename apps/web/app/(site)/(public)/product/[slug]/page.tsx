import { Container } from "@/components/ui/container";

export default function ProductPage({ params }: { params: { slug: string } }) {
	const slug = decodeURIComponent(params.slug);
	return (
		<Container>
			<h1 className="text-xl font-semibold">Producto: {slug}</h1>
			<p className="mt-2 text-neutral-600">
				Detalle del producto (placeholder).
			</p>
		</Container>
	);
}
