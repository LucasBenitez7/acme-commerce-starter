import { Container } from "@/components/ui/container";

export const dynamic = "force-dynamic";
export const revalidate = 0;
export const fetchCache = "force-no-store";
export const runtime = "nodejs";
export const metadata = {
  robots: { index: false, follow: false },
};

export default function AccountPage() {
  return (
    <Container>
      <h1 className="text-xl font-semibold">Cuenta</h1>
      <p className="mt-2 text-neutral-600">
        Inicia sesión para ver tu cuenta (placeholder).
      </p>
    </Container>
  );
}
