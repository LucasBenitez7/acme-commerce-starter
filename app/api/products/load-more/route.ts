import { NextResponse } from "next/server";

import { getPublicProducts } from "@/lib/products/queries";
import { parseSort } from "@/lib/products/utils";

export async function GET(request: Request) {
  const { searchParams } = new URL(request.url);

  // Parse parameters
  const page = Number(searchParams.get("page")) || 1;
  const limit = Number(searchParams.get("limit")) || 12;
  const categorySlug = searchParams.get("categorySlug") || undefined;
  const query = searchParams.get("query") || undefined;
  const onlyOnSale = searchParams.get("onlyOnSale") === "true";

  // Parse filters
  const sizes = searchParams.getAll("sizes");
  const colors = searchParams.getAll("colors");
  const minPrice = searchParams.get("minPrice")
    ? Number(searchParams.get("minPrice"))
    : undefined;
  const maxPrice = searchParams.get("maxPrice")
    ? Number(searchParams.get("maxPrice"))
    : undefined;
  const sortParam = searchParams.get("sort") || undefined;
  const sort = parseSort(sortParam);

  try {
    const { rows, total } = await getPublicProducts({
      page,
      limit,
      categorySlug,
      query,
      onlyOnSale,
      sizes: sizes.length > 0 ? sizes : undefined,
      colors: colors.length > 0 ? colors : undefined,
      minPrice,
      maxPrice,
      sort,
    });

    return NextResponse.json({
      products: rows,
      total,
      hasMore: page * limit < total,
      nextPage: page + 1,
    });
  } catch (error) {
    console.error("Load more API error:", error);
    return NextResponse.json(
      { error: "Error al cargar productos" },
      { status: 500 },
    );
  }
}
