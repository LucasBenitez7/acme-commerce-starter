import { unstable_cache } from "next/cache";

import Footer from "@/components/layout/Footer";
import Header from "@/components/layout/Header";
import { Container } from "@/components/ui/container";

import { prisma } from "@/lib/db";

import type { CategoryLink } from "@/types/catalog";
import type { ReactNode } from "react";

const getCategories = unstable_cache(
  async () => {
    return prisma.category.findMany({
      orderBy: { sort: "asc" },
      select: { slug: true, name: true },
    });
  },
  ["header-categories"],
  { revalidate: 60 },
);

export default async function SiteLayout({
  children,
}: {
  children: ReactNode;
}) {
  const cats = await getCategories();
  const categories: CategoryLink[] = cats.map(
    (c: { slug: string; name: string }) => ({
      slug: c.slug,
      label: c.name,
    }),
  );

  return (
    <div className="flex min-h-dvh flex-col bg-background">
      <Header categories={categories} />
      <div className="flex-1">
        <Container className="py-6 lg:py-8">
          <main>{children}</main>
        </Container>
      </div>
      <Footer />
    </div>
  );
}
