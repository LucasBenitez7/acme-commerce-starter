# Acme Commerce

<p align="center">
  <strong>Tienda online moderna con Next.js, React, Stripe y Prisma</strong>
</p>

<p align="center">
  E-commerce completo con catálogo, carrito, checkout, pagos con Stripe, panel de administración y gestión de pedidos.
</p>

---

## Tabla de contenidos

- [Características](#-características)
- [Stack tecnológico](#-stack-tecnológico)
- [Requisitos previos](#-requisitos-previos)
- [Instalación](#-instalación)
- [Variables de entorno](#-variables-de-entorno)
- [Base de datos](#-base-de-datos)
- [Scripts disponibles](#-scripts-disponibles)
- [Estructura del proyecto](#-estructura-del-proyecto)
- [Despliegue](#-despliegue)

---

## Características

| Área         | Funcionalidades                                                                      |
| ------------ | ------------------------------------------------------------------------------------ |
| **Tienda**   | Catálogo con categorías, filtros, búsqueda, carrito, checkout (invitados y usuarios) |
| **Pagos**    | Stripe (tarjetas), webhooks para confirmación automática                             |
| **Usuarios** | Registro, login, recuperar contraseña, verificación de email                         |
| **Cuenta**   | Perfil, direcciones, historial de pedidos, favoritos, seguridad                      |
| **Pedidos**  | Seguimiento, devoluciones, acceso para invitados (OTP por email)                     |
| **Admin**    | Productos, categorías, pedidos, usuarios, configuración de tienda (hero, rebajas)    |
| **Emails**   | Verificación, bienvenida, reset password, confirmación de pedido                     |

---

## Stack tecnológico

| Categoría         | Tecnología               |
| ----------------- | ------------------------ |
| **Framework**     | Next.js 15 (App Router)  |
| **UI**            | React 19, TypeScript     |
| **Estilos**       | Tailwind CSS 4, Radix UI |
| **Base de datos** | PostgreSQL + Prisma      |
| **Auth**          | NextAuth.js v5           |
| **Pagos**         | Stripe                   |
| **Imágenes**      | Cloudinary               |
| **Emails**        | Resend                   |
| **Estado**        | Zustand                  |
| **Formularios**   | React Hook Form + Zod    |

---

## Requisitos previos

- **Node.js** 18+ (recomendado 20+)
- **pnpm** (gestor de paquetes)
- **PostgreSQL** (local o servicio como Neon, Supabase, etc.)

### Instalar pnpm

```bash
npm install -g pnpm
```

---

## Instalación

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

Copia el archivo de ejemplo y edítalo con tus valores:

```bash
cp .env.example .env.local
```

Edita `.env.local` con tus credenciales (ver sección [Variables de entorno](#-variables-de-entorno)).

### 4. Configurar la base de datos

```bash
# Generar cliente Prisma
pnpm db:generate

# Ejecutar migraciones
pnpm db:migrate

# (Opcional) Poblar con datos iniciales (categorías, tallas, colores, config)
pnpm db:seed
```

### 5. Ejecutar en desarrollo

```bash
pnpm dev
```

La app estará en **http://localhost:3000**.

---

## Variables de entorno

| Variable                                       | Descripción                                                   | Requerido               |
| ---------------------------------------------- | ------------------------------------------------------------- | ----------------------- |
| `NEXT_PUBLIC_SITE_URL`                         | URL pública del sitio (ej: `http://localhost:3000`)           | Sí                      |
| `DATABASE_URL`                                 | Connection string de PostgreSQL                               | Sí                      |
| `AUTH_SECRET`                                  | Secreto para NextAuth (generar con `openssl rand -base64 32`) | Sí                      |
| `ADMIN_EMAILS`                                 | Emails con acceso admin, separados por coma                   | Recomendado             |
| `AUTH_GITHUB_ID` / `AUTH_GITHUB_SECRET`        | Para login con GitHub                                         | Opcional                |
| `STRIPE_SECRET_KEY`                            | Clave secreta de Stripe                                       | Sí (checkout)           |
| `NEXT_PUBLIC_STRIPE_PUBLISHABLE_KEY`           | Clave pública de Stripe                                       | Sí (checkout)           |
| `STRIPE_WEBHOOK_SECRET`                        | Secreto del webhook de Stripe                                 | Sí (confirmación pagos) |
| `RESEND_API_KEY`                               | API key de Resend                                             | Sí (emails)             |
| `EMAIL_FROM`                                   | Remitente de emails (ej: `Tienda <noreply@tudominio.com>`)    | Sí                      |
| `NEXT_PUBLIC_CLOUDINARY_CLOUD_NAME`            | Cloud name de Cloudinary                                      | Sí (imágenes)           |
| `NEXT_PUBLIC_CLOUDINARY_UPLOAD_PRESET`         | Upload preset de Cloudinary                                   | Sí                      |
| `CLOUDINARY_API_KEY` / `CLOUDINARY_API_SECRET` | Credenciales Cloudinary (server-side)                         | Sí                      |
| `CRON_SECRET`                                  | Secreto para autorizar cron jobs (ej: expirar pedidos)        | Sí (Vercel Cron)        |

Consulta `.env.example` para ver todas las variables disponibles.

---

## Base de datos

### Comandos útiles

```bash
# Crear nueva migración
pnpm db:migrate

# Abrir Prisma Studio (interfaz visual)
pnpm db:studio

# Resetear BD y volver a ejecutar seed
pnpm db:reset

# Desplegar migraciones en producción
pnpm db:deploy
```

### Servicios recomendados

- [Neon](https://neon.tech) — PostgreSQL serverless
- [Supabase](https://supabase.com) — PostgreSQL + extras
- [Vercel Postgres](https://vercel.com/storage/postgres)

---

## Scripts disponibles

| Script             | Descripción                        |
| ------------------ | ---------------------------------- |
| `pnpm dev`         | Servidor de desarrollo (Turbopack) |
| `pnpm build`       | Build de producción                |
| `pnpm start`       | Servidor de producción             |
| `pnpm lint`        | Ejecutar ESLint                    |
| `pnpm typecheck`   | Verificar tipos TypeScript         |
| `pnpm format`      | Formatear con Prettier             |
| `pnpm db:generate` | Generar cliente Prisma             |
| `pnpm db:migrate`  | Ejecutar migraciones               |
| `pnpm db:seed`     | Poblar datos iniciales             |
| `pnpm db:studio`   | Abrir Prisma Studio                |
| `pnpm db:reset`    | Resetear BD + seed                 |

---

## Estructura del proyecto

```
acme-commerce-starter/
├── app/
│   ├── (admin)/          # Panel de administración
│   │   └── admin/        # Productos, categorías, pedidos, usuarios, settings
│   ├── (auth)/           # Login, registro, forgot/reset password
│   ├── (site)/           # Sitio público
│   │   ├── (public)/     # Home, catálogo, producto, páginas estáticas
│   │   ├── (shop)/       # Carrito, checkout, tracking
│   │   └── (account)/    # Cuenta de usuario
│   └── api/              # API routes (webhooks, cron, auth)
├── components/           # Componentes React
├── lib/                  # Utilidades, servicios, schemas
├── hooks/                # Custom hooks
├── prisma/
│   ├── schema.prisma     # Modelos de datos
│   └── seed.ts           # Datos iniciales
└── store/                # Estado global (Zustand)
```

---

## Despliegue

### Vercel (recomendado)

1. Conecta el repo en [Vercel](https://vercel.com).
2. Configura las variables de entorno en el dashboard.
3. El script `vercel-build` ejecuta migraciones y build automáticamente.

### Webhook de Stripe

En producción, configura el webhook de Stripe apuntando a:

```
https://tu-dominio.com/api/webhooks/stripe
```

Eventos necesarios: `payment_intent.succeeded`, `payment_intent.payment_failed`.

### Cron (expirar pedidos)

Si usas Vercel Cron, configura el endpoint `/api/cron/expire-orders` con el header:

```
Authorization: Bearer <CRON_SECRET>
```

---

## Licencia

MIT
