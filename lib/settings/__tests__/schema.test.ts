import { describe, it, expect } from "vitest";

import { storeConfigSchema } from "@/lib/settings/schema";

// ─── storeConfigSchema ────────────────────────────────────────────────────────
describe("storeConfigSchema", () => {
  it("acepta objeto vacío (todos los campos son opcionales)", () => {
    expect(storeConfigSchema.safeParse({}).success).toBe(true);
  });

  it("acepta configuración completa válida", () => {
    const result = storeConfigSchema.safeParse({
      heroImage: "https://res.cloudinary.com/demo/hero.jpg",
      heroMobileImage: "https://res.cloudinary.com/demo/hero-mobile.jpg",
      heroTitle: "Bienvenidos",
      heroSubtitle: "La mejor tienda",
      heroLink: "/catalogo",
      saleImage: "https://res.cloudinary.com/demo/sale.jpg",
      saleMobileImage: null,
      saleTitle: "Rebajas",
      saleSubtitle: "Hasta 50% de descuento",
      saleLink: "/rebajas",
      saleBackgroundColor: "#FF0000",
    });
    expect(result.success).toBe(true);
  });

  it("acepta heroImage como null", () => {
    expect(storeConfigSchema.safeParse({ heroImage: null }).success).toBe(true);
  });

  it("rechaza heroTitle vacío cuando se provee", () => {
    const result = storeConfigSchema.safeParse({ heroTitle: "" });
    expect(result.success).toBe(false);
    expect(result.error?.issues[0].message).toBe("El título es requerido");
  });

  it("rechaza saleTitle vacío cuando se provee", () => {
    const result = storeConfigSchema.safeParse({ saleTitle: "" });
    expect(result.success).toBe(false);
    expect(result.error?.issues[0].message).toBe("El título es requerido");
  });
});
