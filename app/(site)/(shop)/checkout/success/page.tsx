import { redirect } from "next/navigation";

import { Container } from "@/components/ui";

import { getOrderFullDetails } from "@/lib/orders/queries";
import { formatOrderForDisplay } from "@/lib/orders/utils";

import { SuccessClient } from "./SuccessClient";

export const dynamic = "force-dynamic";

type Props = {
  searchParams: Promise<{ orderId?: string }>;
};

export default async function SuccessPage({ searchParams }: Props) {
  const { orderId } = await searchParams;

  if (!orderId) redirect("/");

  const rawOrder = await getOrderFullDetails(orderId);

  if (!rawOrder) redirect("/");

  const clientOrder = formatOrderForDisplay(rawOrder);

  return (
    <Container className="py-6 px-4 lg:py-10">
      <SuccessClient order={clientOrder} />
    </Container>
  );
}
