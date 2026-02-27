import { test, expect } from "@playwright/test";

// Test básico de humo para verificar que el setup E2E funciona
// Reemplazar con tests reales en rama test/e2e

test.describe("Smoke tests", () => {
  test("home page loads", async ({ page }) => {
    await page.goto("/");
    await expect(page).toHaveTitle(/.+/);
  });

  test("catalog page loads", async ({ page }) => {
    await page.goto("/catalogo");
    await expect(page.getByRole("main")).toBeVisible();
  });
});
