import type { ReactNode } from "react";
import Header from "../../components/layout/Header";
import Footer from "../../components/layout/Footer";
import { Container } from "@/components/ui/container";

export default function SiteLayout({ children }: { children: ReactNode }) {
  return (
    <div className="flex min-h-dvh flex-col bg-neutral-50 text-neutral-900">
      <Header />
      <div className="flex-1">
        <Container className="py-6 lg:py-8">
          <main>{children}</main>
        </Container>
      </div>
      <Footer />
    </div>
  );
}
