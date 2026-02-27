import "@testing-library/jest-dom";
import { vi } from "vitest";

// ─── Mock Next.js navigation ───────────────────────────────────────────────
vi.mock("next/navigation", () => ({
  useRouter: () => ({
    push: vi.fn(),
    replace: vi.fn(),
    refresh: vi.fn(),
    back: vi.fn(),
    prefetch: vi.fn(),
  }),
  usePathname: () => "/",
  useSearchParams: () => new URLSearchParams(),
  redirect: vi.fn(),
}));

// ─── Mock Next.js cache ─────────────────────────────────────────────────────
vi.mock("next/cache", () => ({
  revalidatePath: vi.fn(),
  revalidateTag: vi.fn(),
}));

// ─── Mock next-auth ─────────────────────────────────────────────────────────
vi.mock("next-auth", () => ({
  default: vi.fn(),
}));

vi.mock("@/lib/auth/index", () => ({
  auth: vi.fn(() => Promise.resolve(null)),
  signIn: vi.fn(),
  signOut: vi.fn(),
}));

// ─── Mock Prisma client ─────────────────────────────────────────────────────
vi.mock("@/lib/db", () => ({
  db: {
    product: {
      findMany: vi.fn(),
      findUnique: vi.fn(),
      create: vi.fn(),
      update: vi.fn(),
      delete: vi.fn(),
      count: vi.fn(),
    },
    category: {
      findMany: vi.fn(),
      findUnique: vi.fn(),
      create: vi.fn(),
      update: vi.fn(),
      delete: vi.fn(),
    },
    order: {
      findMany: vi.fn(),
      findUnique: vi.fn(),
      create: vi.fn(),
      update: vi.fn(),
      count: vi.fn(),
    },
    user: {
      findMany: vi.fn(),
      findUnique: vi.fn(),
      create: vi.fn(),
      update: vi.fn(),
    },
    address: {
      findMany: vi.fn(),
      findUnique: vi.fn(),
      create: vi.fn(),
      update: vi.fn(),
      delete: vi.fn(),
    },
    passwordResetToken: {
      findUnique: vi.fn(),
      create: vi.fn(),
      delete: vi.fn(),
    },
    $transaction: vi.fn((fn: (tx: unknown) => unknown) => fn({})),
  },
}));

// ─── Mock Resend (emails) ───────────────────────────────────────────────────
vi.mock("resend", () => ({
  Resend: vi.fn().mockImplementation(() => ({
    emails: {
      send: vi.fn(() => Promise.resolve({ id: "mock-email-id" })),
    },
  })),
}));

// ─── Mock Cloudinary ────────────────────────────────────────────────────────
vi.mock("cloudinary", () => ({
  v2: {
    config: vi.fn(),
    uploader: {
      upload: vi.fn(),
      destroy: vi.fn(),
    },
  },
}));

// ─── Mock Stripe ────────────────────────────────────────────────────────────
vi.mock("stripe", () => ({
  default: vi.fn().mockImplementation(() => ({
    paymentIntents: {
      create: vi.fn(),
      retrieve: vi.fn(),
    },
    checkout: {
      sessions: {
        create: vi.fn(),
      },
    },
  })),
}));

// ─── Suppress console.error in tests (opcional, descomenta si hay ruido) ───
// const originalConsoleError = console.error;
// beforeAll(() => {
//   console.error = (...args) => {
//     if (typeof args[0] === "string" && args[0].includes("Warning:")) return;
//     originalConsoleError(...args);
//   };
// });
// afterAll(() => {
//   console.error = originalConsoleError;
// });
