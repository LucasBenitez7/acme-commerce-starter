# acme-commerce-starter

Monorepo de e‑commerce (Next.js 15 + Tailwind v4 + Prisma + PostgreSQL) con PNPM + Turborepo, CI en GitHub Actions y despliegue en Vercel.

> **Stack principal**: Next.js (App Router), TypeScript, Tailwind CSS v4, Prisma ORM, PostgreSQL, Redis, Meilisearch, PNPM Workspaces, Turborepo, ESLint (flat), Prettier, Husky + lint‑staged.

---

## 🚀 Características

- **Monorepo PNPM + Turborepo**: apps y paquetes escalables (`apps/web`, `packages/*`).
- **Next.js 15 (App Router)** con React 19.
- **Tailwind v4** + utilidades de UI.
- **Prisma ORM** con **PostgreSQL** (Docker Compose) y migraciones versionadas.
- **Redis** y **Meilisearch** listos en `docker-compose.yml`.
- **Calidad de código**: ESLint (flat), Prettier, Husky + lint‑staged (pre‑commit).
- **CI**: flujo de checks en GitHub Actions.
- **Vercel**: producción en `main` y previsualizaciones en `development` (ajustable).

---

## 📦 Requisitos

- **Node.js 22.x**
- **PNPM 10.x**
- **Docker Desktop** + **Docker Compose**
- **Git**

---

## 📁 Estructura

```
.
├─ apps/
│  └─ web/
│     ├─ app/
│     ├─ components/
│     ├─ lib/
│     ├─ prisma/
│     │  ├─ migrations/
│     │  ├─ schema.prisma
│     │  └─ .env          # (local, NO se comitea)
│     ├─ public/
│     ├─ eslint.config.mjs
│     ├─ next.config.ts
│     ├─ package.json
│     └─ tsconfig.json
├─ packages/               # (futuro @acme/*)
├─ .github/workflows/ci.yml
├─ docker-compose.yml
├─ pnpm-workspace.yaml
├─ tsconfig.base.json
└─ package.json
```

---

## ⚙️ Configuración de entorno

### 1) Variables de entorno (local)

**Fuente de verdad local**: `apps/web/.env.local`
**Plantilla**: `apps/web/.env.example`

Ejemplo mínimo:

```ini
# apps/web/.env.local
NEXT_PUBLIC_SITE_URL=http://localhost:3000
APP_ENV=development

# DB (coincide con docker-compose: 5433)
DATABASE_URL=postgresql://postgres:postgres@localhost:5433/lsbstack

# Redis / Meili (opcionales)
REDIS_URL=redis://localhost:6379
MEILI_HOST=http://localhost:7700
MEILI_MASTER_KEY=meili_master_key

# Opcional
NEXT_PUBLIC_ADMIN_URL=http://localhost:3000/admin
```

> **Producción/CI**: variables definidas en el proveedor (Vercel/GitHub Actions). **No** se suben `.env` al repo.

### 2) Servicios de desarrollo

Arranca Postgres (y opcionalmente Redis/Meili):

```bash
# solo DB
docker compose up -d db
# o todo
docker compose up -d
```

Comprueba estado:

```bash
docker compose ps
```

---

## 🗄️ Prisma + Base de datos

Usamos `dotenv-cli` para que Prisma cargue **.env.local**. Scripts disponibles en `apps/web/package.json`:

```jsonc
{
  "scripts": {
    "db:migrate": "dotenv -e .env.local -- prisma migrate dev",
    "db:deploy": "dotenv -e .env.local -- prisma migrate deploy",
    "db:generate": "dotenv -e .env.local -- prisma generate",
    "db:studio": "dotenv -e .env.local -- prisma studio",
    "db:reset": "dotenv -e .env.local -- prisma migrate reset",
  },
}
```

Comandos típicos:

```bash
# aplicar cambios del schema en dev
pnpm -C apps/web run db:migrate --name <nombre>

# ver tablas y datos
pnpm -C apps/web run db:studio

# regenerar cliente tras cambios de schema
pnpm -C apps/web run db:generate

# reset de DB (cuidado: borra datos)
pnpm -C apps/web run db:reset
```

> Las migraciones se versionan en `apps/web/prisma/migrations/` y **sí** se comitean.

---

## ▶️ Ejecutar en local

Desde la raíz del repo:

```bash
# instalar dependencias del monorepo
pnpm install

# levantar servicios (DB al menos)
docker compose up -d db

# dev solo para web
pnpm dev --filter web
# o todo (si hubiera más apps)
pnpm dev
```

Abrir: [http://localhost:3000](http://localhost:3000)

---

## 🧹 Calidad de código

- **Lint** (root): `pnpm -w lint`
- **Typecheck** (root): `pnpm -w typecheck`
- **Prettier** (root): `pnpm format`

### Husky + lint‑staged

Hook recomendado en `.husky/pre-commit`:

```sh
#!/usr/bin/env sh
. "$(dirname -- "$0")/_/husky.sh"

pnpm exec lint-staged
```

`lint-staged` está configurado en `package.json` (raíz) para ejecutar ESLint/Prettier solo sobre archivos staged.

---

## 🤖 CI/CD

- **GitHub Actions**: workflow `ci.yml` ejecuta checks en PRs y pushes.
- **Vercel**: producción en `main` y previsualizaciones (preview) configurables (p. ej. `development`).

---

## 🔧 Troubleshooting

- **`Could not resolve @prisma/client`**: instala y genera **en el paquete que contiene el schema**:

  ```bash
  pnpm -C apps/web add @prisma/client prisma -D
  pnpm -C apps/web exec prisma generate
  ```

- **`P1012 Environment variable not found: DATABASE_URL`**: asegúrate de tener `apps/web/.env.local` y usa scripts con `dotenv-cli` (o crea `apps/web/prisma/.env` local).
- **VS Code: SchemaStore `ECONNRESET`**: añade `$schema` en `tsconfig.json` y `tsconfig.base.json`:

  ```json
  { "$schema": "https://json.schemastore.org/tsconfig", ... }
  ```

---

## 🗺️ Roadmap corto

- [ ] Autenticación (login/registro) y roles (admin/usuario).
- [ ] Rutas protegidas + panel admin.
- [ ] Favoritos, pedidos/ordenes del usuario.
- [ ] Seed inicial (categorías/productos demo).
- [ ] Búsqueda con Meilisearch.
- [ ] Integración pagos / impuestos por región.

---

## 📜 Licencia

ISC © Lucas
