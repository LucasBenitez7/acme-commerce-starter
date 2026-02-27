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
  <img src="https://img.shields.io/badge/license-MIT-green?style=for-the-badge" alt="MIT License" />
</p>

<p align="center">
  Plataforma de comercio electrónico lista para producción con catálogo de productos, carrito, checkout completo, pagos con Stripe, panel de administración y sistema de cuentas de usuario.
</p>

---

## Tabla de contenidos

- [✨ Características](#-características)
- [🧱 Stack tecnológico](#-stack-tecnológico)
- [📋 Requisitos previos](#-requisitos-previos)
- [🚀 Instalación y puesta en marcha](#-instalación-y-puesta-en-marcha)
- [⚙️ Variables de entorno](#️-variables-de-entorno)
- [🗄️ Base de datos](#️-base-de-datos)
- [🧪 Scripts disponibles](#-scripts-disponibles)
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

### 🔧 Panel de Administración

- Gestión completa de productos y categorías (CRUD)
- Gestión de pedidos y usuarios
- Configuración de tienda: hero banner, precios de rebajas, featured products
- Subida de imágenes con Cloudinary

### 📧 Emails Transaccionales

- Verificación de cuenta, bienvenida, reset de contraseña
- Confirmación y actualización de pedidos
- Plantillas con **React Email** + **Resend**

---

## 🧱 Stack tecnológico

| Categoría         | Tecnología                                                                                                                        |
| ----------------- | --------------------------------------------------------------------------------------------------------------------------------- |
| **Framework**     | [Next.js 15](https://nextjs.org) (App Router + Turbopack)                                                                         |
| **UI**            | [React 19](https://react.dev), TypeScript 5                                                                                       |
| **Estilos**       | [Tailwind CSS v4](https://tailwindcss.com), [Radix UI](https://www.radix-ui.com), [Framer Motion](https://www.framer.com/motion/) |
| **Base de datos** | PostgreSQL + [Prisma ORM](https://www.prisma.io)                                                                                  |
| **Auth**          | [NextAuth.js v5](https://authjs.dev) + Prisma Adapter                                                                             |
| **Pagos**         | [Stripe](https://stripe.com)                                                                                                      |
| **Imágenes**      | [Cloudinary](https://cloudinary.com)                                                                                              |
| **Emails**        | [Resend](https://resend.com) + React Email                                                                                        |
| **Estado global** | [Zustand](https://zustand-demo.pmnd.rs)                                                                                           |
| **Formularios**   | [React Hook Form](https://react-hook-form.com) + [Zod](https://zod.dev)                                                           |
| **Carrusel**      | [Embla Carousel](https://www.embla-carousel.com)                                                                                  |
| **Linting**       | ESLint 9, Prettier, Husky + lint-staged                                                                                           |

---

## 📋 Requisitos previos

Antes de empezar, asegúrate de tener instalado:

- **Node.js** `v18+` (recomendado `v20+`) — [descargar](https://nodejs.org)
- **pnpm** `v10+` — gestor de paquetes
- **PostgreSQL** — local o un servicio cloud como [Neon](https://neon.tech) o [Supabase](https://supabase.com)
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

### 3. Configurar variables de entorno

```bash
cp .env.example .env.local
```

Edita `.env.local` con tus credenciales. Consulta la sección [⚙️ Variables de entorno](#️-variables-de-entorno) para ver qué necesitas.

### 4. Configurar la base de datos

```bash
# Generar el cliente de Prisma
pnpm db:generate

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
| `APP_ENV`                      | Entorno (`development` o `production`)              | ✅ Sí     |

### Autenticación (NextAuth.js)

| Variable             | Descripción                                       | Requerido      |
| -------------------- | ------------------------------------------------- | -------------- |
| `AUTH_SECRET`        | Secreto para NextAuth (`openssl rand -base64 32`) | ✅ Sí          |
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
| `CLOUDINARY_API_KEY`                   | API Key de Cloudinary (server-side)    | ✅ Sí     |
| `CLOUDINARY_API_SECRET`                | API Secret de Cloudinary (server-side) | ✅ Sí     |

### Otros

| Variable       | Descripción                                | Requerido        |
| -------------- | ------------------------------------------ | ---------------- |
| `DATABASE_URL` | Connection string de PostgreSQL            | ✅ Sí            |
| `CRON_SECRET`  | Secreto para autorizar cron jobs de Vercel | ⚠️ En producción |

> Ver `.env.example` para la lista completa de variables con valores de ejemplo.

---

## 🗄️ Base de datos

### Comandos disponibles

```bash
# Crear y ejecutar una nueva migración (desarrollo)
pnpm db:migrate

# Aplicar migraciones en producción (sin prompt)
pnpm db:deploy

# Abrir Prisma Studio — interfaz visual para explorar/editar datos
pnpm db:studio

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

## 🧪 Scripts disponibles

| Script             | Descripción                             |
| ------------------ | --------------------------------------- |
| `pnpm dev`         | Servidor de desarrollo con Turbopack    |
| `pnpm build`       | Build de producción                     |
| `pnpm start`       | Servidor de producción (requiere build) |
| `pnpm lint`        | Análisis estático con ESLint            |
| `pnpm typecheck`   | Verificación de tipos con TypeScript    |
| `pnpm format`      | Formateo de código con Prettier         |
| `pnpm db:generate` | Regenerar el cliente de Prisma          |
| `pnpm db:migrate`  | Crear y ejecutar migraciones            |
| `pnpm db:deploy`   | Aplicar migraciones en producción       |
| `pnpm db:seed`     | Poblar la BD con datos iniciales        |
| `pnpm db:studio`   | Abrir Prisma Studio                     |
| `pnpm db:reset`    | Resetear BD + volver a aplicar seed     |

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
│   └── seed.ts                 # Script de datos iniciales
│
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

Configura el cron en `vercel.json` (ya incluido en el repositorio).

---

## 📄 Licencia

Distribuido bajo la licencia **MIT**. Consulta el archivo [LICENSE](./LICENSE) para más información.

---

<p align="center">
  Realizado con Next.js, Stripe y Prisma
</p>
