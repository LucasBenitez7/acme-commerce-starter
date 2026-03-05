<h1 align="center">
  <br />
  🛍️ Acme Commerce
  <br />
</h1>

<p align="center">
  <strong>E-commerce moderno y completo construido con Next.js 15, Stripe y Prisma</strong>
</p>

<p align="center">
  <a href="https://nextjs.org"><img src="https://img.shields.io/badge/Next.js-15-black?style=for-the-badge&logo=next.js" alt="Next.js 15" /></a>
  <a href="https://react.dev"><img src="https://img.shields.io/badge/React-19-61DAFB?style=for-the-badge&logo=react&logoColor=white" alt="React 19" /></a>
  <a href="https://www.typescriptlang.org"><img src="https://img.shields.io/badge/TypeScript-5-3178C6?style=for-the-badge&logo=typescript&logoColor=white" alt="TypeScript" /></a>
  <a href="https://stripe.com"><img src="https://img.shields.io/badge/Stripe-Payments-635BFF?style=for-the-badge&logo=stripe&logoColor=white" alt="Stripe" /></a>
  <a href="https://www.prisma.io"><img src="https://img.shields.io/badge/Prisma-ORM-2D3748?style=for-the-badge&logo=prisma&logoColor=white" alt="Prisma" /></a>
  <a href="https://vitest.dev"><img src="https://img.shields.io/badge/Vitest-Unit_Tests-6E9F18?style=for-the-badge&logo=vitest&logoColor=white" alt="Vitest" /></a>
  <a href="https://playwright.dev"><img src="https://img.shields.io/badge/Playwright-E2E-45ba4b?style=for-the-badge&logo=playwright&logoColor=white" alt="Playwright" /></a>
  <img src="https://img.shields.io/badge/license-MIT-green?style=for-the-badge" alt="MIT License" />
</p>

<p align="center">
  Plataforma de comercio electrónico lista para producción con catálogo de productos, carrito, checkout completo, pagos con Stripe, panel de administración, sistema de cuentas de usuario y suite de tests completa (unit + E2E).
</p>

---

## Tabla de contenidos

- [✨ Características](#-características)
- [🧱 Stack tecnológico](#-stack-tecnológico)
- [📋 Requisitos previos](#-requisitos-previos)
- [🚀 Instalación y puesta en marcha](#-instalación-y-puesta-en-marcha)
- [⚙️ Variables de entorno](#️-variables-de-entorno)
- [🗄️ Base de datos](#️-base-de-datos)
- [🧪 Testing](#-testing)
- [📜 Scripts disponibles](#-scripts-disponibles)
- [🤖 CI/CD](#-cicd)
- [🗂️ Estructura del proyecto](#️-estructura-del-proyecto)
- [☁️ Despliegue](#️-despliegue)
- [📄 Licencia](#-licencia)

---

## ✨ Características

### 🛒 Tienda

- Catálogo de productos con categorías, filtros (talla, color, precio) y búsqueda en tiempo real
- Páginas de detalle de producto con galería de imágenes y selección de variantes
- Carrito persistente con actualización de cantidades
- Checkout completo para usuarios registrados e invitados

### 💳 Pagos

- Integración nativa con **Stripe** (tarjetas de crédito/débito)
- Webhooks para confirmación automática de pedidos
- Manejo de pagos fallidos y reintentos

### 👤 Usuarios & Cuentas

- Registro, login y login social (GitHub)
- Verificación de email y recuperación de contraseña
- Panel de cuenta: perfil, direcciones, historial de pedidos, favoritos y seguridad

### 📦 Pedidos

- Seguimiento de estado de pedidos en tiempo real
- Sistema de devoluciones
- Acceso para invitados mediante OTP por email
- Expiración automática de pedidos pendientes (cron job)

### 🔧 Panel de Administración

- Gestión completa de productos y categorías (CRUD)
- Gestión de pedidos y usuarios
- Configuración de tienda: hero banner, precios de rebajas, featured products
- Subida de imágenes con Cloudinary

### 📧 Emails Transaccionales

- Verificación de cuenta, bienvenida, reset de contraseña
- Confirmación y actualización de pedidos
- Plantillas con **React Email** + **Resend**

### 🧪 Testing

- **Tests unitarios e integración** con Vitest + Testing Library + coverage con v8
- **Tests E2E** con Playwright: autenticación, carrito, checkout, admin, devoluciones
- **CI completo** en GitHub Actions con 3 etapas: lint/typecheck → tests → E2E

---

## 🧱 Stack tecnológico

| Categoría           | Tecnología                                                                                                                        |
| ------------------- | --------------------------------------------------------------------------------------------------------------------------------- |
| **Framework**       | [Next.js 15](https://nextjs.org) (App Router + Turbopack)                                                                         |
| **UI**              | [React 19](https://react.dev), TypeScript 5                                                                                       |
| **Estilos**         | [Tailwind CSS v4](https://tailwindcss.com), [Radix UI](https://www.radix-ui.com), [Framer Motion](https://www.framer.com/motion/) |
| **Base de datos**   | PostgreSQL + [Prisma ORM](https://www.prisma.io)                                                                                  |
| **Auth**            | [NextAuth.js v5](https://authjs.dev) + Prisma Adapter                                                                             |
| **Pagos**           | [Stripe](https://stripe.com)                                                                                                      |
| **Imágenes**        | [Cloudinary](https://cloudinary.com)                                                                                              |
| **Emails**          | [Resend](https://resend.com) + React Email                                                                                        |
| **Estado global**   | [Zustand](https://zustand-demo.pmnd.rs)                                                                                           |
| **Formularios**     | [React Hook Form](https://react-hook-form.com) + [Zod](https://zod.dev)                                                           |
| **Carrusel**        | [Embla Carousel](https://www.embla-carousel.com)                                                                                  |
| **Tests unitarios** | [Vitest](https://vitest.dev) + [Testing Library](https://testing-library.com) + [MSW](https://mswjs.io)                           |
| **Tests E2E**       | [Playwright](https://playwright.dev)                                                                                              |
| **Linting**         | ESLint 9, Prettier, Husky + lint-staged                                                                                           |

---

## 📋 Requisitos previos

Antes de empezar, asegúrate de tener instalado:

- **Node.js** `v22+` — [descargar](https://nodejs.org)
- **pnpm** `v10+` — gestor de paquetes
- **Docker Desktop** — para la base de datos local y los tests
- **PostgreSQL** — local (via Docker) o servicio cloud como [Neon](https://neon.tech) o [Supabase](https://supabase.com)
- Una cuenta de **Stripe** (modo test para desarrollo)
- Una cuenta de **Cloudinary** (plan gratuito suficiente para empezar)
- Una cuenta de **Resend** (plan gratuito suficiente para empezar)

```bash
# Instalar pnpm si no lo tienes
npm install -g pnpm
```

---

## 🚀 Instalación y puesta en marcha

### 1. Clonar el repositorio

```bash
git clone https://github.com/tu-usuario/acme-commerce-starter.git
cd acme-commerce-starter
```

### 2. Instalar dependencias

```bash
pnpm install
```

> El `postinstall` ejecuta `prisma generate` automáticamente.

### 3. Configurar variables de entorno

```bash
cp .env.example .env.local
```

Edita `.env.local` con tus credenciales. Consulta la sección [⚙️ Variables de entorno](#️-variables-de-entorno) para ver qué necesitas.

### 4. Configurar la base de datos

```bash
# Ejecutar migraciones (crea las tablas en tu BD)
pnpm db:migrate

# (Opcional pero recomendado) Poblar con datos iniciales
# Incluye: categorías, tallas, colores y configuración de tienda
pnpm db:seed
```

### 5. Configurar Stripe Webhook (desarrollo local)

Para recibir eventos de Stripe en local, usa el CLI de Stripe:

```bash
stripe listen --forward-to localhost:3000/api/webhooks/stripe
```

> 💡 Stripe CLI te mostrará en consola el `STRIPE_WEBHOOK_SECRET` que debes pegar en tu `.env.local`.

### 6. Arrancar el servidor de desarrollo

```bash
pnpm dev
```

La aplicación estará disponible en **[http://localhost:3000](http://localhost:3000)**

---

## ⚙️ Variables de entorno

### Aplicación

| Variable                       | Descripción                                         | Requerido |
| ------------------------------ | --------------------------------------------------- | --------- |
| `NEXT_PUBLIC_SITE_URL`         | URL pública del sitio (ej: `http://localhost:3000`) | ✅ Sí     |
| `NEXT_PUBLIC_DEFAULT_CURRENCY` | Moneda por defecto (ej: `EUR`, `USD`)               | ✅ Sí     |
| `APP_ENV`                      | Entorno (`development`, `test` o `production`)      | ✅ Sí     |

### Autenticación (NextAuth.js)

| Variable             | Descripción                                       | Requerido      |
| -------------------- | ------------------------------------------------- | -------------- |
| `AUTH_SECRET`        | Secreto para NextAuth (`openssl rand -base64 32`) | ✅ Sí          |
| `AUTH_URL`           | URL base de la app para NextAuth                  | ✅ Sí          |
| `ADMIN_EMAILS`       | Emails con acceso admin, separados por coma       | ⚠️ Recomendado |
| `AUTH_GITHUB_ID`     | Client ID de tu GitHub OAuth App                  | ➕ Opcional    |
| `AUTH_GITHUB_SECRET` | Client Secret de tu GitHub OAuth App              | ➕ Opcional    |

### Pagos (Stripe)

| Variable                             | Descripción                        | Requerido |
| ------------------------------------ | ---------------------------------- | --------- |
| `STRIPE_SECRET_KEY`                  | Clave secreta de Stripe (`sk_...`) | ✅ Sí     |
| `NEXT_PUBLIC_STRIPE_PUBLISHABLE_KEY` | Clave pública de Stripe (`pk_...`) | ✅ Sí     |
| `STRIPE_WEBHOOK_SECRET`              | Secreto del webhook (`whsec_...`)  | ✅ Sí     |

### Emails (Resend)

| Variable         | Descripción                                    | Requerido |
| ---------------- | ---------------------------------------------- | --------- |
| `RESEND_API_KEY` | API key de Resend (`re_...`)                   | ✅ Sí     |
| `EMAIL_FROM`     | Remitente (ej: `Acme <noreply@tudominio.com>`) | ✅ Sí     |

### Imágenes (Cloudinary)

| Variable                               | Descripción                            | Requerido |
| -------------------------------------- | -------------------------------------- | --------- |
| `NEXT_PUBLIC_CLOUDINARY_CLOUD_NAME`    | Cloud name de tu cuenta Cloudinary     | ✅ Sí     |
| `NEXT_PUBLIC_CLOUDINARY_UPLOAD_PRESET` | Upload preset (modo unsigned)          | ✅ Sí     |
| `NEXT_PUBLIC_CLOUDINARY_API_KEY`       | API Key pública de Cloudinary          | ✅ Sí     |
| `CLOUDINARY_API_KEY`                   | API Key de Cloudinary (server-side)    | ✅ Sí     |
| `CLOUDINARY_API_SECRET`                | API Secret de Cloudinary (server-side) | ✅ Sí     |

### Otros

| Variable       | Descripción                                | Requerido        |
| -------------- | ------------------------------------------ | ---------------- |
| `DATABASE_URL` | Connection string de PostgreSQL            | ✅ Sí            |
| `CRON_SECRET`  | Secreto para autorizar cron jobs de Vercel | ⚠️ En producción |

> Ver `.env.example` para la lista completa con valores de ejemplo.

---

## 🗄️ Base de datos

### Comandos disponibles

```bash
# Crear y ejecutar una nueva migración (desarrollo)
pnpm db:migrate

# Aplicar migraciones en producción (sin prompt)
pnpm db:deploy

# Regenerar el cliente de Prisma tras cambios de schema
pnpm db:generate

# Abrir Prisma Studio — interfaz visual para explorar/editar datos
pnpm db:studio

# Poblar la BD con datos iniciales (categorías, tallas, colores, etc.)
pnpm db:seed

# Resetear la BD y volver a aplicar el seed (¡elimina todos los datos!)
pnpm db:reset
```

### Servicios cloud recomendados

| Servicio                                               | Plan gratuito | Descripción                            |
| ------------------------------------------------------ | ------------- | -------------------------------------- |
| [Neon](https://neon.tech)                              | ✅            | PostgreSQL serverless con autoescalado |
| [Supabase](https://supabase.com)                       | ✅            | PostgreSQL + storage + auth integrado  |
| [Vercel Postgres](https://vercel.com/storage/postgres) | ✅            | Integración nativa con Vercel          |

---

## 🧪 Testing

El proyecto cuenta con una suite de tests completa dividida en dos niveles.

### Tests unitarios e integración (Vitest)

Usa **Vitest** con **jsdom** como entorno, **Testing Library** para render de componentes y **MSW** para mockear peticiones HTTP.

```bash
# Ejecutar todos los tests una sola vez
pnpm test:run

# Modo watch (re-ejecuta al guardar)
pnpm test:watch

# Con UI interactiva en el navegador
pnpm test:ui

# Generar reporte de cobertura (texto + JSON + HTML)
pnpm test:coverage
```

El reporte de cobertura se genera en la carpeta `coverage/`. Abre `coverage/index.html` en el navegador para verlo en detalle.

La configuración excluye automáticamente `node_modules`, `.next`, `e2e`, `prisma` y archivos de configuración del análisis de cobertura.

### Tests E2E (Playwright)

Los tests E2E arrancan la aplicación con Next.js y validan flujos reales contra una base de datos de test aislada.

**Flujos cubiertos:**

- `auth.spec.ts` — Registro, login, logout y acceso protegido
- `cart-checkout.spec.ts` — Añadir al carrito y proceso de checkout (usuario autenticado)
- `admin-product.spec.ts` — CRUD completo de productos en el panel admin
- `admin-orders.spec.ts` — Gestión de pedidos en el panel admin
- `returns.spec.ts` — Solicitud y gestión de devoluciones

**Proyectos de Playwright configurados:**

- `setup` — Autenticación guardada en storage state (usuario y admin)
- `chromium` — Tests públicos sin autenticación
- `chromium-user` — Tests con sesión de usuario normal
- `chromium-admin` — Tests con sesión de administrador

#### Puesta en marcha de los tests E2E

**1. Crear el archivo de entorno para E2E:**

```bash
cp .env.e2e.example .env.e2e
```

Edita `.env.e2e` con las credenciales de los usuarios de prueba (`E2E_ADMIN_EMAIL`, `E2E_ADMIN_PASSWORD`, etc.).

**2. Levantar la base de datos de test (Docker):**

```bash
# Levanta PostgreSQL en el puerto 5434 (aislado de desarrollo)
pnpm db:e2e:up
```

**3. Aplicar migraciones y seed de datos E2E:**

```bash
pnpm db:e2e:migrate
pnpm db:e2e:seed
```

O en un solo comando:

```bash
pnpm test:e2e:prepare
```

**4. Instalar los navegadores de Playwright (solo la primera vez):**

```bash
pnpm playwright install chromium
```

**5. Ejecutar los tests:**

```bash
# Modo headless (terminal)
pnpm test:e2e

# Con UI interactiva de Playwright
pnpm test:e2e:ui

# Modo debug (paso a paso)
pnpm test:e2e:debug
```

> El servidor Next.js se levanta automáticamente antes de correr los tests y se apaga al terminar.

#### Entorno de base de datos para tests

El archivo `docker-compose.test.yml` levanta un contenedor PostgreSQL **efímero** en el puerto `5434` (sin volumen persistente, arranca limpio en cada ejecución):

```bash
# Levantar
pnpm db:e2e:up

# Apagar y eliminar contenedor
pnpm db:e2e:down

# Resetear datos E2E sin apagar el contenedor
pnpm db:e2e:reset
```

---

## 📜 Scripts disponibles

### Desarrollo

| Script           | Descripción                             |
| ---------------- | --------------------------------------- |
| `pnpm dev`       | Servidor de desarrollo con Turbopack    |
| `pnpm build`     | Build de producción                     |
| `pnpm start`     | Servidor de producción (requiere build) |
| `pnpm lint`      | Análisis estático con ESLint            |
| `pnpm typecheck` | Verificación de tipos con TypeScript    |
| `pnpm format`    | Formateo de código con Prettier         |

### Base de datos

| Script             | Descripción                                    |
| ------------------ | ---------------------------------------------- |
| `pnpm db:generate` | Regenerar el cliente de Prisma                 |
| `pnpm db:migrate`  | Crear y ejecutar migraciones (desarrollo)      |
| `pnpm db:deploy`   | Aplicar migraciones en producción (sin prompt) |
| `pnpm db:seed`     | Poblar la BD con datos iniciales               |
| `pnpm db:studio`   | Abrir Prisma Studio                            |
| `pnpm db:reset`    | Resetear BD + volver a aplicar seed            |

### Tests unitarios

| Script               | Descripción                                         |
| -------------------- | --------------------------------------------------- |
| `pnpm test:run`      | Ejecutar todos los tests una vez                    |
| `pnpm test:watch`    | Modo watch (re-ejecuta al guardar)                  |
| `pnpm test:ui`       | Interfaz visual de Vitest en el navegador           |
| `pnpm test:coverage` | Tests con reporte de cobertura (HTML + JSON + text) |

### Tests E2E

| Script                  | Descripción                                          |
| ----------------------- | ---------------------------------------------------- |
| `pnpm test:e2e`         | Ejecutar todos los tests E2E (headless)              |
| `pnpm test:e2e:ui`      | Interfaz visual de Playwright                        |
| `pnpm test:e2e:debug`   | Modo debug paso a paso                               |
| `pnpm test:e2e:prepare` | Levantar BD test + migraciones + seed (todo en uno)  |
| `pnpm db:e2e:up`        | Levantar contenedor PostgreSQL de test (puerto 5434) |
| `pnpm db:e2e:down`      | Apagar y eliminar el contenedor de test              |
| `pnpm db:e2e:migrate`   | Aplicar migraciones sobre la BD de test              |
| `pnpm db:e2e:seed`      | Seed de datos para E2E                               |
| `pnpm db:e2e:reset`     | Resetear datos E2E sin apagar el contenedor          |

---

## 🤖 CI/CD

El pipeline de **GitHub Actions** (`.github/workflows/ci.yml`) se ejecuta en cada push y PR con 3 etapas secuenciales:

```
Lint & Typecheck → Unit & Integration Tests → E2E Tests
```

### Etapa 1 — Lint & Typecheck

- ESLint sobre todo el código
- TypeScript `tsc --noEmit`

### Etapa 2 — Unit & Integration Tests

- Levanta PostgreSQL 16 como servicio
- Ejecuta migraciones sobre la BD de test
- Corre `pnpm test:coverage`
- Sube el reporte de cobertura como artefacto de GitHub Actions

### Etapa 3 — E2E Tests

- Solo se ejecuta en las ramas `main` y `development`
- Levanta PostgreSQL 16, aplica migraciones y seed E2E
- Hace build de producción de Next.js
- Corre `pnpm test:e2e` con Playwright (Chromium)
- Sube el reporte de Playwright como artefacto

> Los secretos necesarios para CI se configuran en **Settings → Secrets and variables → Actions** del repositorio.

### Cron Job — Expirar pedidos

El workflow `.github/workflows/cron.yml` llama al endpoint `/api/cron/expire-orders` diariamente a las 00:00 UTC para marcar como expirados los pedidos pendientes de pago.

---

## 🗂️ Estructura del proyecto

```
acme-commerce-starter/
├── app/
│   ├── (admin)/                # Panel de administración (protegido)
│   │   └── admin/              # Productos, categorías, pedidos, usuarios, settings
│   ├── (auth)/                 # Flujos de autenticación
│   │   └── auth/               # Login, registro, forgot/reset password
│   ├── (site)/                 # Sitio público
│   │   ├── (public)/           # Home, catálogo, detalle de producto, páginas estáticas
│   │   ├── (shop)/             # Carrito, checkout, tracking de pedidos
│   │   └── (account)/          # Panel de cuenta de usuario
│   └── api/                    # API Routes (webhooks Stripe, cron jobs, auth)
│
├── components/                 # Componentes React reutilizables
│   ├── admin/                  # Componentes exclusivos del panel admin
│   ├── auth/                   # Formularios y UI de autenticación
│   ├── shop/                   # Componentes de la tienda (carrito, checkout...)
│   └── ui/                     # Componentes base (botones, modales, inputs...)
│
├── lib/                        # Lógica de negocio y utilidades
│   ├── actions/                # Server Actions de Next.js
│   ├── services/               # Servicios externos (Stripe, Cloudinary, Resend)
│   └── schemas/                # Esquemas de validación con Zod
│
├── hooks/                      # Custom React Hooks
├── store/                      # Estado global con Zustand
├── types/                      # Tipos TypeScript globales
│
├── prisma/
│   ├── schema.prisma           # Modelos de la base de datos
│   ├── migrations/             # Historial de migraciones
│   ├── seed.ts                 # Seed de desarrollo
│   └── seed.e2e.ts             # Seed específico para tests E2E
│
├── __tests__/                  # Tests unitarios e integración (Vitest)
├── e2e/                        # Tests end-to-end (Playwright)
│   ├── auth.setup.ts           # Setup de autenticación compartida
│   ├── auth.spec.ts            # Tests de registro y login
│   ├── cart-checkout.spec.ts   # Tests de carrito y checkout
│   ├── admin-product.spec.ts   # Tests de gestión de productos
│   ├── admin-orders.spec.ts    # Tests de gestión de pedidos
│   └── returns.spec.ts         # Tests de devoluciones
│
├── vitest.config.ts            # Configuración de Vitest
├── playwright.config.ts        # Configuración de Playwright
├── docker-compose.yml          # Servicios de desarrollo
├── docker-compose.test.yml     # PostgreSQL aislado para tests (puerto 5434)
├── .env.example                # Plantilla de variables de entorno
├── .env.e2e.example            # Plantilla de variables para E2E
└── public/                     # Assets estáticos
```

---

## ☁️ Despliegue

### Vercel (recomendado)

1. Haz push de tu repositorio a GitHub.
2. Conecta el repo en [Vercel](https://vercel.com) y haz clic en **Deploy**.
3. Añade todas las variables de entorno en el dashboard de Vercel.
4. El script `vercel-build` ejecuta `prisma migrate deploy` y `next build` automáticamente.

> **⚠️ Importante:** Si usas streaming o Server-Sent Events, asegúrate de tener habilitado **Fluid Compute** en Vercel.

### Configurar Webhook de Stripe en producción

En tu [dashboard de Stripe](https://dashboard.stripe.com/webhooks), añade un endpoint apuntando a:

```
https://tu-dominio.com/api/webhooks/stripe
```

Eventos requeridos:

- `payment_intent.succeeded`
- `payment_intent.payment_failed`

### Cron Jobs (expirar pedidos pendientes)

Si usas Vercel Cron, el endpoint `/api/cron/expire-orders` requiere el siguiente header de autorización:

```
Authorization: Bearer <CRON_SECRET>
```

Configura el cron en `vercel.json` (ya incluido en el repositorio). El job se ejecuta diariamente a las 00:00 UTC.

---

## 📄 Licencia

Distribuido bajo la licencia **MIT**. Consulta el archivo [LICENSE](./LICENSE) para más información.

---

<p align="center">
  Realizado con Next.js, Stripe, Prisma, Vitest y Playwright
</p>
