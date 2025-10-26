import { Container } from "@/components/ui/container";

import { prisma } from "@/lib/db";

import Footer from "../../components/layout/Footer";
import Header from "../../components/layout/Header";

export const revalidate = 60;

import type { ReactNode } from "react";

export default async function SiteLayout({
  children,
}: {
  children: ReactNode;
}) {
  const cats = await prisma.category.findMany({
    orderBy: { name: "asc" },
    select: { slug: true, name: true },
  });

  const categories = cats.map((c) => ({ slug: c.slug, label: c.name }));

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
