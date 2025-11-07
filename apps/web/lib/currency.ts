export type SupportedCurrency = "EUR" | "PYG";

export const MINOR_UNITS: Record<SupportedCurrency, number> = {
  EUR: 2,
  PYG: 0,
} as const;

export const DEFAULT_CURRENCY: SupportedCurrency =
  process.env.NEXT_PUBLIC_DEFAULT_CURRENCY === "PYG" ? "PYG" : "EUR";

export const LOCALE_BY_CURRENCY: Record<SupportedCurrency, string> = {
  EUR: "es-ES",
  PYG: "es-PY",
} as const;

export function parseCurrency(input?: string | null): SupportedCurrency {
  return input === "PYG" ? "PYG" : "EUR";
}

export function toMajor(amountMinor: number, currency: SupportedCurrency) {
  const decimals = MINOR_UNITS[currency];
  return amountMinor / 10 ** decimals;
}

export function formatMinor(
  amountMinor: number,
  currency: SupportedCurrency,
  locale?: string,
) {
  const l = locale ?? LOCALE_BY_CURRENCY[currency];
  const major = toMajor(amountMinor, currency);

  try {
    return new Intl.NumberFormat(l, { style: "currency", currency }).format(
      major,
    );
  } catch {
    const fixed = major.toFixed(MINOR_UNITS[currency]);
    return `${fixed} ${currency}`;
  }
}
