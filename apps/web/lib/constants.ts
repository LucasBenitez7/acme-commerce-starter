// Tallas estandarizadas
export const CLOTHING_SIZES = [
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
];
export const SHOE_SIZES = [
  "36",
  "37",
  "38",
  "39",
  "40",
  "41",
  "42",
  "43",
  "44",
  "45",
];

// Colores disponibles con su representación visual (Hex)
export const PRODUCT_COLORS = [
  { name: "Negro", hex: "#171717" },
  { name: "Blanco", hex: "#FFFFFF" },
  { name: "Azul Marino", hex: "#1e3a8a" },
  { name: "Beige", hex: "#d6c0a1" },
  { name: "Rojo", hex: "#dc2626" },
  { name: "Verde", hex: "#15803d" },
  { name: "Gris", hex: "#6b7280" },
  { name: "Naranja", hex: "#f97316" },
  { name: "Morado", hex: "#8b5cf6" },
  { name: "Amarillo", hex: "#fcd34d" },
  { name: "Azul", hex: "#3b82f6" },
  { name: "Gris Oscuro", hex: "#4b5563" },
  { name: "Marrón", hex: "#332000" },
  { name: "Default", hex: "#e5e5e5" },
  // Agrega aquí todos los que quieras
] as const;

// Helper para obtener el Hex dado un nombre (usado en ProductCard)
export const COLOR_MAP: Record<string, string> = PRODUCT_COLORS.reduce(
  (acc, color) => ({ ...acc, [color.name]: color.hex }),
  { Default: "#e5e5e5" }, // Fallback
);

export const RETURN_REASONS = [
  "No me queda bien la talla",
  "El producto es diferente a la foto",
  "Llegó dañado o defectuoso",
  "Me equivoqué al pedirlo",
  "Ya no lo quiero",
  "Otro motivo",
];

export const REJECTION_REASONS = [
  "El producto está usado o sin etiquetas",
  "Fuera del plazo de devolución",
  "No se aprecian los daños mencionados",
  "El producto no corresponde con el pedido original",
  "Otro motivo",
];

export const INITIAL_CATEGORIES = [
  { slug: "chaquetas", name: "Chaquetas" },
  { slug: "pantalones", name: "Pantalones" },
  { slug: "vestidos", name: "Vestidos" },
  { slug: "jeans", name: "Jeans" },
  { slug: "jerseys", name: "Jerseys" },
  { slug: "camisetas", name: "Camisetas" },
  { slug: "ropa-interior", name: "Ropa interior" },
  { slug: "zapatillas", name: "Zapatillas" },
] as const;
