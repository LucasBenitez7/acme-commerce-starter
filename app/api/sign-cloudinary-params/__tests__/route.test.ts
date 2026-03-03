import { describe, it, expect, beforeEach, vi } from "vitest";

vi.hoisted(() => {
  process.env.CLOUDINARY_API_KEY = "test_api_key";
  process.env.CLOUDINARY_API_SECRET = "test_api_secret";
  process.env.NEXT_PUBLIC_CLOUDINARY_CLOUD_NAME = "test_cloud";
});

// ─── Cloudinary mock ──────────────────────────────────────────────────────────
const { mockApiSignRequest } = vi.hoisted(() => ({
  mockApiSignRequest: vi.fn(),
}));

vi.mock("cloudinary", () => ({
  v2: {
    config: vi.fn(),
    utils: {
      api_sign_request: mockApiSignRequest,
    },
  },
}));

import { POST } from "@/app/api/sign-cloudinary-params/route";

function makeRequest(body: Record<string, any> = {}) {
  return {
    json: vi.fn().mockResolvedValue(body),
  } as unknown as Request;
}

beforeEach(() => {
  vi.clearAllMocks();
});

describe("POST /api/sign-cloudinary-params", () => {
  it("llama a api_sign_request con los paramsToSign y devuelve la firma", async () => {
    mockApiSignRequest.mockReturnValue("mock_signature_abc");

    const paramsToSign = { timestamp: 1234567890, folder: "products" };
    const res = await POST(makeRequest({ paramsToSign }));
    const body = await res.json();

    expect(res.status).toBe(200);
    expect(body).toEqual({ signature: "mock_signature_abc" });
    expect(mockApiSignRequest).toHaveBeenCalledWith(
      paramsToSign,
      "test_api_secret",
    );
  });

  it("devuelve la firma generada por Cloudinary", async () => {
    mockApiSignRequest.mockReturnValue("firma_unica_xyz");

    const res = await POST(makeRequest({ paramsToSign: { timestamp: 999 } }));
    const body = await res.json();

    expect(body.signature).toBe("firma_unica_xyz");
  });

  it("pasa exactamente los paramsToSign recibidos en el body", async () => {
    mockApiSignRequest.mockReturnValue("sig_abc");

    const paramsToSign = {
      timestamp: 111,
      public_id: "img_test",
      eager: "w_400",
    };
    await POST(makeRequest({ paramsToSign }));

    expect(mockApiSignRequest).toHaveBeenCalledWith(
      paramsToSign,
      expect.any(String),
    );
  });
});
