import { CLOTHING_SIZES } from "../constants";

export function sortSizes(sizes: string[]): string[] {
  return [...sizes].sort((a, b) => {
    const idxA = CLOTHING_SIZES.indexOf(a);
    const idxB = CLOTHING_SIZES.indexOf(b);

    if (idxA !== -1 && idxB !== -1) {
      return idxA - idxB;
    }

    const numA = parseFloat(a);
    const numB = parseFloat(b);

    if (!isNaN(numA) && !isNaN(numB)) {
      return numA - numB;
    }

    return a.localeCompare(b);
  });
}
