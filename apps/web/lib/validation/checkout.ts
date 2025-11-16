export function isValidEmail(email: string): boolean {
  if (!email) return false;
  return /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email);
}

export function isNonEmptyMin(text: string, min: number): boolean {
  return text.trim().length >= min;
}

/**
 * Teléfono opcional. Si viene vacío es válido.
 * Acepta números y signos típicos (+, espacios, guiones, paréntesis).
 */
export function isValidPhone(phone: string): boolean {
  if (!phone) return true;
  return /^[0-9+\s()-]{6,20}$/.test(phone);
}
