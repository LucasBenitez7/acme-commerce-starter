import { describe, it, expect, vi, beforeEach } from "vitest";

const { mockRedirect } = vi.hoisted(() => ({ mockRedirect: vi.fn() }));
const mockCookieGet = vi.fn();

vi.mock("next/navigation", () => ({
  redirect: mockRedirect,
  useRouter: vi.fn(),
  usePathname: () => "/",
  useSearchParams: vi.fn(() => new URLSearchParams()),
}));

vi.mock("next/headers", () => ({
  cookies: vi.fn(() =>
    Promise.resolve({
      get: mockCookieGet,
    }),
  ),
}));

import { verifyGuestAccessOrRedirect } from "@/lib/guest-access/server-utils";

describe("verifyGuestAccessOrRedirect", () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  it("redirige a /tracking si no hay cookie de acceso", async () => {
    mockCookieGet.mockReturnValue(undefined);

    await verifyGuestAccessOrRedirect("order-1");

    expect(mockRedirect).toHaveBeenCalledWith("/tracking");
  });

  it("devuelve true si la cookie existe", async () => {
    mockCookieGet.mockReturnValue({ value: "true" });

    const result = await verifyGuestAccessOrRedirect("order-1");

    expect(mockRedirect).not.toHaveBeenCalled();
    expect(result).toBe(true);
  });

  it("busca la cookie con el orderId correcto", async () => {
    mockCookieGet.mockReturnValue({ value: "true" });

    await verifyGuestAccessOrRedirect("order-abc");

    expect(mockCookieGet).toHaveBeenCalledWith("guest_access_order-abc");
  });
});
