export function isValidEmail(email: string): boolean {
  if (!email) return false;

  const trimmed = email.trim();

  if (trimmed.length < 5 || trimmed.length > 254) return false;

  const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]{2,}$/;

  return emailRegex.test(trimmed);
}

export function isNonEmptyMin(text: string, min: number): boolean {
  return text.trim().length >= min;
}

export function isValidPhone(phone: string): boolean {
  const trimmed = phone.trim();
  if (!trimmed) return false;

  return /^[0-9+\s()-]{6,20}$/.test(trimmed);
}

export function isValidPostalCodeES(postalCode: string): boolean {
  const trimmed = postalCode.trim();
  if (!/^\d{5}$/.test(trimmed)) return false;

  const firstTwo = parseInt(trimmed.slice(0, 2), 10);
  return firstTwo >= 1 && firstTwo <= 52;
}
