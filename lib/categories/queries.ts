import "server-only";
import { unstable_cache } from "next/cache";

import { prisma } from "@/lib/db";

export type CategoryLink = {
  slug: string;
  label: string;
};

export const getHeaderCategories = unstable_cache(
  async (): Promise<CategoryLink[]> => {
    const cats = await prisma.category.findMany({
      orderBy: { sort: "asc" },
      select: { slug: true, name: true },
    });
    return cats.map((c) => ({ slug: c.slug, label: c.name }));
  },
  ["header-categories@v1"],
  { revalidate: 3600 },
);

export async function getCategoryBySlug(slug: string) {
  if (!slug) return null;

  const cached = unstable_cache(
    async () => {
      return prisma.category.findUnique({
        where: { slug },
        select: { id: true, name: true, slug: true },
      });
    },
    ["category-by-slug@v1", slug],
    { revalidate: 3600 },
  );

  return cached();
}
