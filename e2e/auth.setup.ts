import path from "path";

import { test as setup } from "@playwright/test";

const userAuthFile = path.join(__dirname, ".auth/user.json");
const adminAuthFile = path.join(__dirname, ".auth/admin.json");

// ─── Setup: guarda sesión de usuario normal ──────────────────────────────────
setup("authenticate as user", async ({ page }) => {
  await page.goto("/auth/login");

  // El form usa name="email" y name="password" via Credentials provider
  await page
    .getByLabel(/email/i)
    .fill(process.env.E2E_USER_EMAIL ?? "user@test.com");
  await page
    .getByLabel(/contraseña/i)
    .fill(process.env.E2E_USER_PASSWORD ?? "Test1234!");
  await page.getByRole("button", { name: /iniciar sesión/i }).click();

  // Tu authConfig redirige a /account tras login de usuario normal
  await page.waitForURL("**/account", { timeout: 10_000 });
  await page.context().storageState({ path: userAuthFile });
});

// ─── Setup: guarda sesión de admin ───────────────────────────────────────────
// Un admin es simplemente un user cuyo email está en ADMIN_EMAILS env var
// No hay ruta especial de login, usa el mismo /auth/login
setup("authenticate as admin", async ({ page }) => {
  await page.goto("/auth/login");

  await page
    .getByLabel(/email/i)
    .fill(process.env.E2E_ADMIN_EMAIL ?? "admin@test.com");
  await page
    .getByLabel(/contraseña/i)
    .fill(process.env.E2E_ADMIN_PASSWORD ?? "Admin1234!");
  await page.getByRole("button", { name: /iniciar sesión/i }).click();

  await page.waitForURL("**/admin", { timeout: 10_000 });
  await page.context().storageState({ path: adminAuthFile });
});
