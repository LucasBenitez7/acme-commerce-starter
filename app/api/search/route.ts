import { NextResponse } from "next/server";

import { prisma } from "@/lib/db";
import { getPublicProducts } from "@/lib/products/queries";

export async function GET(request: Request) {
  const { searchParams } = new URL(request.url);
  const query = searchParams.get("q");
  const limit = Number(searchParams.get("limit")) || 6;

  if (!query || query.trim().length === 0) {
    return NextResponse.json({ products: [], total: 0, suggestions: [] });
  }

  const queryLower = query.trim().toLowerCase();

  try {
    // 1. Fetch products usando la función existente
    const { rows, total } = await getPublicProducts({
      query: query.trim(),
      limit,
      page: 1,
    });

    // 2. Generate suggestions - Solo palabras que EMPIEZAN con query
    const suggestions: string[] = [];

    // Categorías
    const categories = await prisma.category.findMany({
      select: { name: true },
    });

    categories.forEach((cat) => {
      const words = cat.name.toLowerCase().split(/\s+/);
      if (words.some((word) => word.startsWith(queryLower))) {
        suggestions.push(cat.name);
      }
    });

    // Nombres de productos que matchearon
    rows.slice(0, 10).forEach((prod) => {
      suggestions.push(prod.name);
    });

    // Eliminar duplicados y limitar
    const uniqueSuggestions = [...new Set(suggestions)]
      .sort((a, b) => {
        const aStarts = a.toLowerCase().startsWith(queryLower);
        const bStarts = b.toLowerCase().startsWith(queryLower);
        if (aStarts && !bStarts) return -1;
        if (!aStarts && bStarts) return 1;
        return a.localeCompare(b);
      })
      .slice(0, 6);

    return NextResponse.json({
      products: rows,
      total,
      suggestions: uniqueSuggestions,
    });
  } catch (error) {
    console.error("Search API error:", error);
    return NextResponse.json(
      { error: "Error al buscar productos" },
      { status: 500 },
    );
  }
}
