import { formatMinor, parseCurrency } from "@/lib/currency";

export function formatPrice(
  amountMinor: number,
  currency: string = "EUR",
  locale?: string,
) {
  // parseCurrency normaliza a "EUR" | "PYG"
  return formatMinor(amountMinor ?? 0, parseCurrency(currency), locale);
}
