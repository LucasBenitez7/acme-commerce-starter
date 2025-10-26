// apps/web/lib/format.ts
export function formatPrice(
  priceCents: number,
  currency: string = "EUR",
  locale: string = "es-ES",
) {
  const amount = (priceCents ?? 0) / 100;
  try {
    return new Intl.NumberFormat(locale, {
      style: "currency",
      currency,
      maximumFractionDigits: 2,
    }).format(amount);
  } catch {
    return `${amount.toFixed(2)} ${currency}`;
  }
}
