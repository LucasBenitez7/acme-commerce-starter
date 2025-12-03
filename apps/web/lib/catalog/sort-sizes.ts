const SIZE_ORDER = [
  "XXXS",
  "XXS",
  "XS",
  "S",
  "M",
  "L",
  "XL",
  "XXL",
  "2XL",
  "3XL",
  "4XL",
  "Única",
  "One Size",
];

export function sortSizes(sizes: string[]): string[] {
  return [...sizes].sort((a, b) => {
    // 1. Intentamos buscar si son tallas de ropa estándar
    const idxA = SIZE_ORDER.indexOf(a);
    const idxB = SIZE_ORDER.indexOf(b);

    // Si ambas están en nuestra lista (ej: S y L), ordenamos por su índice
    if (idxA !== -1 && idxB !== -1) {
      return idxA - idxB;
    }

    // 2. Si no son letras, intentamos ver si son números (Zapatos: 38, 42...)
    const numA = parseFloat(a);
    const numB = parseFloat(b);

    // Si ambos son números válidos, ordenamos numéricamente
    if (!isNaN(numA) && !isNaN(numB)) {
      return numA - numB;
    }

    return a.localeCompare(b);
  });
}
