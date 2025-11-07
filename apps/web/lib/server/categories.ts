import "server-only";
import { unstable_cache } from "next/cache";

import { prisma } from "@/lib/db";

import type { CategoryLink } from "@/types/catalog";

export const getHeaderCategories = unstable_cache(
  async (): Promise<CategoryLink[]> => {
    const cats = await prisma.category.findMany({
      orderBy: { sort: "asc" },
      select: { slug: true, name: true },
    });
    return cats.map((c) => ({ slug: c.slug, label: c.name }));
  },
  ["header-categories@v1"],
  { revalidate: 60 },
);

export const getCategoryBySlug = unstable_cache(
  async (slug: string) => {
    if (!slug) return null;
    return prisma.category.findUnique({
      where: { slug },
      select: { id: true, name: true, slug: true },
    });
  },
  ["category-by-slug@v1"],
  { revalidate: 60 },
);
