import { PrismaClient } from "@prisma/client";
const prisma = new PrismaClient();

const CATEGORIES = [
	{ slug: "remeras", name: "Remeras" },
	{ slug: "pantalones", name: "Pantalones" },
	{ slug: "camperas", name: "Camperas" },
	{ slug: "zapatillas", name: "Zapatillas" },
];

function euros(n) {
	return Math.round(n * 100);
}

function makeProducts() {
	const base = [];
	let i = 1;
	for (const cat of CATEGORIES) {
		for (let k = 0; k < 6; k++) {
			const id = i++;
			const name = `Producto ${id}`;
			const price = ((id * 3.99) % 200) + 9.99;
			base.push({
				slug: `producto-${id}`,
				name,
				description: `Descripción del ${name}.`,
				priceCents: euros(price),
				categorySlug: cat.slug,
				images: [
					{
						url: `https://placehold.co/800x1000?text=${encodeURIComponent(
							name
						)}`,
						alt: name,
						sort: 0,
					},
				],
			});
		}
	}
	return base;
}

async function main() {
	console.log("Seeding…");

	// upsert categorías
	const cats = {};
	for (const c of CATEGORIES) {
		const r = await prisma.category.upsert({
			where: { slug: c.slug },
			update: { name: c.name },
			create: { slug: c.slug, name: c.name },
		});
		cats[c.slug] = r.id;
	}

	// productos
	const products = makeProducts();
	for (const p of products) {
		const categoryId = cats[p.categorySlug];
		await prisma.product.upsert({
			where: { slug: p.slug },
			update: {
				name: p.name,
				description: p.description,
				priceCents: p.priceCents,
				currency: "EUR",
				categoryId,
			},
			create: {
				slug: p.slug,
				name: p.name,
				description: p.description,
				priceCents: p.priceCents,
				currency: "EUR",
				categoryId,
				images: {
					create: p.images.map((img) => ({
						url: img.url,
						alt: img.alt,
						sort: img.sort,
					})),
				},
			},
		});
	}

	const count = await prisma.product.count();
	console.log(`OK: ${count} productos.`);
}

main()
	.catch((e) => {
		console.error(e);
		process.exit(1);
	})
	.finally(async () => {
		await prisma.$disconnect();
	});
