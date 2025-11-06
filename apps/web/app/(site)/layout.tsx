import { Header, Footer } from "@/components/layout";
import { Container } from "@/components/ui";

import { getHeaderCategories } from "@/lib/server/categories";

import type { ReactNode } from "react";

export default async function SiteLayout({
  children,
}: {
  children: ReactNode;
}) {
  const categories = await getHeaderCategories();

  return (
    <div className="flex min-h-dvh flex-col bg-background">
      <Header categories={categories} />
      <div className="flex-1">
        <Container>
          <main>{children}</main>
        </Container>
      </div>
      <Footer />
    </div>
  );
}
