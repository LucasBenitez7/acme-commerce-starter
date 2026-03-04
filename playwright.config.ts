import { defineConfig, devices } from "@playwright/test";

export default defineConfig({
  testDir: "./e2e",
  fullyParallel: true,
  forbidOnly: !!process.env.CI,
  retries: process.env.CI ? 2 : 0,
  workers: process.env.CI ? 1 : undefined,
  reporter: process.env.CI ? "github" : "html",
  timeout: 90_000,

  use: {
    baseURL: process.env.PLAYWRIGHT_BASE_URL ?? "http://localhost:3000",
    trace: "on-first-retry",
    screenshot: "only-on-failure",
  },

  projects: [
    // ── Setup: autenticación guardada en storage state ──────────────────────
    // Se ejecuta en serie para evitar competencia en la compilación del endpoint
    {
      name: "setup",
      testMatch: /.*\.setup\.ts/,
      fullyParallel: false,
    },

    // ── Desktop Chrome (sin auth) ────────────────────────────────────────────
    {
      name: "chromium",
      use: { ...devices["Desktop Chrome"] },
      dependencies: ["setup"],
      testIgnore: /cart-checkout\.spec\.ts/,
    },

    // ── Autenticado como usuario normal ─────────────────────────────────────
    {
      name: "chromium-user",
      use: {
        ...devices["Desktop Chrome"],
        storageState: "e2e/.auth/user.json",
      },
      dependencies: ["setup"],
      testIgnore: /auth\.spec\.ts/,
    },

    // ── Autenticado como admin ────────────────────────────────────────────────
    {
      name: "chromium-admin",
      use: {
        ...devices["Desktop Chrome"],
        storageState: "e2e/.auth/admin.json",
      },
      dependencies: ["setup"],
      testIgnore: /auth\.spec\.ts|cart-checkout\.spec\.ts/,
    },
  ],

  // Levanta Next.js antes de correr los tests E2E
  webServer: {
    command: "dotenv -e .env.e2e -- next dev --turbopack",
    url: "http://localhost:3000",
    reuseExistingServer: !process.env.CI,
    timeout: 120_000,
  },
});
