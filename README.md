<h1 align="center">
  <br />
  🛍️ Acme Commerce
  <br />
</h1>

<p align="center">
  <strong>Full stack e-commerce platform built with Next.js 15, Stripe and Prisma</strong>
</p>

<p align="center">
  <a href="https://nextjs.org"><img src="https://img.shields.io/badge/Next.js-15-black?style=for-the-badge&logo=next.js" alt="Next.js 15" /></a>
  <a href="https://react.dev"><img src="https://img.shields.io/badge/React-19-61DAFB?style=for-the-badge&logo=react&logoColor=white" alt="React 19" /></a>
  <a href="https://www.typescriptlang.org"><img src="https://img.shields.io/badge/TypeScript-5-3178C6?style=for-the-badge&logo=typescript&logoColor=white" alt="TypeScript" /></a>
  <a href="https://stripe.com"><img src="https://img.shields.io/badge/Stripe-Payments-635BFF?style=for-the-badge&logo=stripe&logoColor=white" alt="Stripe" /></a>
  <a href="https://www.prisma.io"><img src="https://img.shields.io/badge/Prisma-ORM-2D3748?style=for-the-badge&logo=prisma&logoColor=white" alt="Prisma" /></a>
  <a href="https://vitest.dev"><img src="https://img.shields.io/badge/Vitest-Unit_Tests-6E9F18?style=for-the-badge&logo=vitest&logoColor=white" alt="Vitest" /></a>
  <a href="https://playwright.dev"><img src="https://img.shields.io/badge/Playwright-E2E-45ba4b?style=for-the-badge&logo=playwright&logoColor=white" alt="Playwright" /></a>
  <a href="https://github.com/LucasBenitez7/acme-commerce-starter/actions"><img src="https://img.shields.io/github/actions/workflow/status/LucasBenitez7/acme-commerce-starter/ci.yml?branch=main&style=for-the-badge&label=CI&logo=github" alt="CI" /></a>
  <img src="https://img.shields.io/badge/license-MIT-green?style=for-the-badge" alt="MIT License" />
</p>

<p align="center">
  Production-ready e-commerce platform with product catalog, cart, full checkout, Stripe payments, admin panel, user accounts, and a complete test suite (unit + E2E).
</p>

---

## 🚀 Live Demo

**🌐 [shop.lsbstack.com](https://shop.lsbstack.com)**

> Payments run in **Stripe test mode** — no real charges. Use the test card `4242 4242 4242 4242` with any future date and any CVC.

### Demo credentials

| Role      | Email                 | Password           |
| --------- | --------------------- | ------------------ |
| **Admin** | `demoadmin123@dm.com` | `demoadmin.123xyz` |

⚠️ The demo account has read-only access to the admin panel —
products, orders, users and settings are visible but cannot be
created, edited or deleted. This protects the live data.

---

## 💡 What this project demonstrates

This is a production-grade application solving real engineering challenges — not a tutorial clone.

- **Full authentication flow** — NextAuth.js v5 with credentials, GitHub OAuth, email OTP for guest orders, email verification, password reset, and role-based route protection (user / admin)
- **Real payment integration** — Stripe Payment Intents + Webhooks for async order confirmation, failed payment handling, and automatic order expiration via cron jobs
- **Complete test suite** — Vitest + Testing Library (unit/integration), Playwright E2E with isolated test database and shared auth state, MSW for HTTP mocking, coverage with v8
- **Production CI/CD** — GitHub Actions pipeline: lint → typecheck → unit tests → E2E tests, with coverage reports and Playwright artifacts uploaded on each run
- **Admin panel** — full CRUD for products, categories, orders, and users; image management with Cloudinary; store configuration (hero banner, sales prices, featured products)
- **Transactional emails** — welcome, email verification, password reset, order confirmation and updates — built with React Email + Resend
- **Real deployment** — Vercel with preview deployments, Neon (serverless PostgreSQL), Cloudinary for media, Resend for email, Stripe webhooks configured in production

---

## 🧱 Tech stack

| Category       | Technology                                                                                                                        |
| -------------- | --------------------------------------------------------------------------------------------------------------------------------- |
| **Framework**  | [Next.js 15](https://nextjs.org) (App Router + Turbopack)                                                                         |
| **UI**         | [React 19](https://react.dev), TypeScript 5                                                                                       |
| **Styling**    | [Tailwind CSS v4](https://tailwindcss.com), [Radix UI](https://www.radix-ui.com), [Framer Motion](https://www.framer.com/motion/) |
| **Database**   | PostgreSQL + [Prisma ORM](https://www.prisma.io)                                                                                  |
| **Auth**       | [NextAuth.js v5](https://authjs.dev) + Prisma Adapter                                                                             |
| **Payments**   | [Stripe](https://stripe.com)                                                                                                      |
| **Images**     | [Cloudinary](https://cloudinary.com)                                                                                              |
| **Emails**     | [Resend](https://resend.com) + React Email                                                                                        |
| **State**      | [Zustand](https://zustand-demo.pmnd.rs)                                                                                           |
| **Forms**      | [React Hook Form](https://react-hook-form.com) + [Zod](https://zod.dev)                                                           |
| **Unit tests** | [Vitest](https://vitest.dev) + [Testing Library](https://testing-library.com) + [MSW](https://mswjs.io)                           |
| **E2E tests**  | [Playwright](https://playwright.dev)                                                                                              |
| **Linting**    | ESLint 9, Prettier, Husky + lint-staged                                                                                           |

---

## ✨ Features

### 🛒 Store

- Product catalog with categories, filters (size, color, price) and real-time search
- Product detail pages with image gallery and variant selection
- Persistent cart with quantity updates
- Full checkout for registered users and guests

### 💳 Payments

- Native **Stripe** integration (credit/debit cards)
- Webhooks for automatic order confirmation
- Failed payment handling and retries

### 👤 Users & Accounts

- Registration, login and social login (GitHub)
- Email verification and password recovery
- Account panel: profile, addresses, order history, favorites, and security

### 📦 Orders

- Real-time order status tracking
- Returns system
- Guest access via email OTP
- Automatic expiration of pending orders (cron job)

### 🔧 Admin Panel

- Full product and category management (CRUD)
- Order and user management
- Store configuration: hero banner, sale prices, featured products
- Image uploads with Cloudinary

### 📧 Transactional Emails

- Account verification, welcome, password reset
- Order confirmation and updates
- Templates built with **React Email** + **Resend**

### 🧪 Testing

- **Unit & integration tests** with Vitest + Testing Library + v8 coverage
- **E2E tests** with Playwright: auth, cart, checkout, admin, returns
- **Full CI** with GitHub Actions — 3 stages: lint/typecheck → tests → E2E

---

## 📋 Prerequisites

- **Node.js** `v22+`
- **pnpm** `v10+`
- **Docker Desktop** — for local database and tests
- A **Stripe** account (test mode for development)
- A **Cloudinary** account (free plan is enough)
- A **Resend** account (free plan is enough)

```bash
npm install -g pnpm
```

---

## 🚀 Getting started

### 1. Clone the repository

```bash
git clone https://github.com/LucasBenitez7/acme-commerce-starter.git
cd acme-commerce-starter
```

### 2. Install dependencies

```bash
pnpm install
```

> `postinstall` runs `prisma generate` automatically.

### 3. Set up environment variables

```bash
cp .env.example .env.local
```

Edit `.env.local` with your credentials. See [⚙️ Environment variables](#️-environment-variables) for details.

### 4. Set up the database

```bash
pnpm db:migrate
pnpm db:seed  # optional but recommended
```

### 5. Set up Stripe Webhook (local development)

```bash
stripe listen --forward-to localhost:3000/api/webhooks/stripe
```

> Stripe CLI will print the `STRIPE_WEBHOOK_SECRET` — paste it into your `.env.local`.

### 6. Start the dev server

```bash
pnpm dev
```

Available at **[http://localhost:3000](http://localhost:3000)**

---

## ⚙️ Environment variables

### App

| Variable                       | Description                                       | Required |
| ------------------------------ | ------------------------------------------------- | -------- |
| `NEXT_PUBLIC_SITE_URL`         | Public site URL                                   | ✅       |
| `NEXT_PUBLIC_DEFAULT_CURRENCY` | Default currency (`EUR`, `USD`)                   | ✅       |
| `APP_ENV`                      | Environment (`development`, `test`, `production`) | ✅       |

### Auth (NextAuth.js)

| Variable             | Description                                 | Required |
| -------------------- | ------------------------------------------- | -------- |
| `AUTH_SECRET`        | NextAuth secret (`openssl rand -base64 32`) | ✅       |
| `AUTH_URL`           | App base URL for NextAuth                   | ✅       |
| `ADMIN_EMAILS`       | Comma-separated admin emails                | ⚠️       |
| `AUTH_GITHUB_ID`     | GitHub OAuth App Client ID                  | ➕       |
| `AUTH_GITHUB_SECRET` | GitHub OAuth App Client Secret              | ➕       |

### Payments (Stripe)

| Variable                             | Description                       | Required |
| ------------------------------------ | --------------------------------- | -------- |
| `STRIPE_SECRET_KEY`                  | Stripe secret key (`sk_...`)      | ✅       |
| `NEXT_PUBLIC_STRIPE_PUBLISHABLE_KEY` | Stripe publishable key (`pk_...`) | ✅       |
| `STRIPE_WEBHOOK_SECRET`              | Webhook secret (`whsec_...`)      | ✅       |

### Emails (Resend)

| Variable         | Description               | Required |
| ---------------- | ------------------------- | -------- |
| `RESEND_API_KEY` | Resend API key (`re_...`) | ✅       |
| `EMAIL_FROM`     | Sender address            | ✅       |

### Images (Cloudinary)

| Variable                               | Description                    | Required |
| -------------------------------------- | ------------------------------ | -------- |
| `NEXT_PUBLIC_CLOUDINARY_CLOUD_NAME`    | Cloudinary cloud name          | ✅       |
| `NEXT_PUBLIC_CLOUDINARY_UPLOAD_PRESET` | Upload preset (unsigned)       | ✅       |
| `NEXT_PUBLIC_CLOUDINARY_API_KEY`       | Cloudinary public API key      | ✅       |
| `CLOUDINARY_API_KEY`                   | Cloudinary server-side API key | ✅       |
| `CLOUDINARY_API_SECRET`                | Cloudinary API secret          | ✅       |

### Other

| Variable       | Description                  | Required      |
| -------------- | ---------------------------- | ------------- |
| `DATABASE_URL` | PostgreSQL connection string | ✅            |
| `CRON_SECRET`  | Secret for Vercel cron jobs  | ⚠️ Production |

---

## 🗄️ Database

```bash
pnpm db:migrate    # create and run migrations (dev)
pnpm db:deploy     # apply migrations in production
pnpm db:generate   # regenerate Prisma client
pnpm db:studio     # open Prisma Studio
pnpm db:seed       # seed initial data
pnpm db:reset      # reset DB and re-seed
```

---

## 🧪 Testing

### Unit & integration tests (Vitest)

```bash
pnpm test:run       # run all tests once
pnpm test:watch     # watch mode
pnpm test:ui        # interactive UI in browser
pnpm test:coverage  # coverage report (HTML + JSON + text)
```

### E2E tests (Playwright)

**Flows covered:** auth · cart & checkout · admin product CRUD · admin orders · returns

```bash
# 1. Copy E2E env file and fill credentials
cp .env.e2e.example .env.e2e

# 2. Start test database + migrations + seed
pnpm test:e2e:prepare

# 3. Install browsers (first time only)
pnpm playwright install chromium

# 4. Run tests
pnpm test:e2e          # headless
pnpm test:e2e:ui       # interactive UI
pnpm test:e2e:debug    # step-by-step debug
```

---

## 🤖 CI/CD

GitHub Actions pipeline runs on every push and PR:

```
Lint & Typecheck → Unit & Integration Tests → E2E Tests
```

- **Stage 1** — ESLint + TypeScript `tsc --noEmit`
- **Stage 2** — PostgreSQL service + migrations + `pnpm test:coverage` + coverage artifact upload
- **Stage 3** — PostgreSQL + E2E seed + Next.js production build + Playwright (Chromium) + report artifact upload. Runs only on `main` and `development` branches.

---

## 🗂️ Project structure

```
acme-commerce-starter/
├── app/
│   ├── (admin)/          # Admin panel (protected)
│   ├── (auth)/           # Auth flows
│   ├── (site)/
│   │   ├── (public)/     # Home, catalog, product detail
│   │   ├── (shop)/       # Cart, checkout, order tracking
│   │   └── (account)/    # User account panel
│   └── api/              # API routes (Stripe webhooks, cron, auth)
├── components/           # Reusable React components
├── lib/
│   ├── actions/          # Next.js Server Actions
│   ├── services/         # External services (Stripe, Cloudinary, Resend)
│   └── schemas/          # Zod validation schemas
├── hooks/                # Custom React hooks
├── store/                # Zustand global state
├── prisma/
│   ├── schema.prisma
│   ├── migrations/
│   ├── seed.ts
│   └── seed.e2e.ts
├── __tests__/            # Vitest unit & integration tests
└── e2e/                  # Playwright E2E tests
```

---

## ☁️ Deployment

### Vercel (recommended)

1. Push to GitHub and connect the repo in [Vercel](https://vercel.com)
2. Add all environment variables in the Vercel dashboard
3. `vercel-build` runs `prisma migrate deploy` + `next build` automatically

### Stripe Webhook (production)

Add a webhook endpoint in your [Stripe dashboard](https://dashboard.stripe.com/webhooks):

```
https://your-domain.com/api/webhooks/stripe
```

Required events: `payment_intent.succeeded` · `payment_intent.payment_failed`

---

## 📄 License

Distributed under the **MIT** License.
