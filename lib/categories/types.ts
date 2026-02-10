import type { Category } from "@prisma/client";

// DTO para la tabla de Admin
export type AdminCategoryItem = Category & {
  _count: {
    products: number;
  };
};

// DTO para el Header/Menú
export type CategoryLink = {
  slug: string;
  label: string;
};

// DTO para filtros de Admin
export type AdminCategoryFilters = {
  page?: number;
  limit?: number;
  query?: string;
  sortBy?: string;
  sortOrder?: "asc" | "desc";
  filter?: "all" | "with_products" | "empty" | "featured";
};
