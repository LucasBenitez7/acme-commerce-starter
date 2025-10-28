import { Container } from "@/components/ui/container";

export const dynamic = "force-dynamic";
export const revalidate = 0;
export const fetchCache = "force-no-store";
export const runtime = "nodejs";

export default function CartPage() {
  return (
    <Container>
      <h1 className="text-xl font-semibold">Carrito</h1>
      <p className="mt-2 text-neutral-600">
        Tu carrito está vacío (placeholder).
      </p>
    </Container>
  );
}
