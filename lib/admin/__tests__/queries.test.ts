import { describe, it, expect, vi, beforeEach } from "vitest";

import {
  getPendingReturnsCount,
  getDashboardStats,
  getAdminUsers,
  getAdminUserDetails,
} from "@/lib/admin/queries";
import { prisma } from "@/lib/db";

beforeEach(() => {
  vi.clearAllMocks();
});

const mockUser = {
  id: "user-1",
  name: "Lucas",
  email: "lucas@test.com",
  role: "user",
  createdAt: new Date(),
  addresses: [],
  orders: [],
  _count: { orders: 2 },
};

// ─── getPendingReturnsCount ───────────────────────────────────────────────────

describe("getPendingReturnsCount", () => {
  it("devuelve el número de pedidos con devolución pendiente", async () => {
    vi.mocked(prisma.order.count).mockResolvedValue(3);

    const result = await getPendingReturnsCount();

    expect(prisma.order.count).toHaveBeenCalledWith(
      expect.objectContaining({
        where: expect.objectContaining({ isCancelled: false }),
      }),
    );
    expect(result).toBe(3);
  });

  it("devuelve 0 si no hay devoluciones pendientes", async () => {
    vi.mocked(prisma.order.count).mockResolvedValue(0);

    const result = await getPendingReturnsCount();

    expect(result).toBe(0);
  });
});

// ─── getDashboardStats ────────────────────────────────────────────────────────

describe("getDashboardStats", () => {
  beforeEach(() => {
    vi.mocked(prisma.order.count).mockResolvedValue(10);
    vi.mocked(prisma.product.count).mockResolvedValue(20);
    vi.mocked(prisma.user.count).mockResolvedValue(5);
    vi.mocked(prisma.productVariant.count).mockResolvedValue(50);
    vi.mocked(prisma.productVariant.aggregate).mockResolvedValue({
      _sum: { stock: 200 },
    } as any);
    vi.mocked(prisma.order.findMany).mockResolvedValue([]);
  });

  it("devuelve las estadísticas del dashboard correctamente", async () => {
    const result = await getDashboardStats();

    expect(result).toMatchObject({
      totalOrders: expect.any(Number),
      totalProducts: expect.any(Number),
      totalUsers: expect.any(Number),
      grossRevenue: expect.any(Number),
      netRevenue: expect.any(Number),
    });
  });

  it("calcula grossRevenue sumando totalMinor de pedidos pagados", async () => {
    vi.mocked(prisma.order.findMany).mockResolvedValue([
      { totalMinor: 1000, items: [] },
      { totalMinor: 2000, items: [] },
    ] as any);

    const result = await getDashboardStats();

    expect(result.grossRevenue).toBe(3000);
    expect(result.netRevenue).toBe(3000);
  });

  it("calcula totalRefunds y netRevenue con items devueltos", async () => {
    vi.mocked(prisma.order.findMany).mockResolvedValue([
      {
        totalMinor: 5000,
        items: [{ priceMinorSnapshot: 1000, quantityReturned: 2 }],
      },
    ] as any);

    const result = await getDashboardStats();

    expect(result.grossRevenue).toBe(5000);
    expect(result.totalRefunds).toBe(2000);
    expect(result.netRevenue).toBe(3000);
    expect(result.returnedItemsCount).toBe(2);
  });

  it("calcula archivedProducts correctamente", async () => {
    vi.mocked(prisma.product.count)
      .mockResolvedValueOnce(20) // totalProducts
      .mockResolvedValueOnce(15); // activeProducts

    const result = await getDashboardStats();

    expect(result.totalProducts).toBe(20);
    expect(result.activeProducts).toBe(15);
    expect(result.archivedProducts).toBe(5);
  });

  it("totalStock es 0 si aggregate devuelve null", async () => {
    vi.mocked(prisma.productVariant.aggregate).mockResolvedValue({
      _sum: { stock: null },
    } as any);

    const result = await getDashboardStats();

    expect(result.totalStock).toBe(0);
  });
});

// ─── getAdminUsers ────────────────────────────────────────────────────────────

describe("getAdminUsers", () => {
  it("devuelve usuarios con paginación por defecto", async () => {
    vi.mocked(prisma.user.findMany).mockResolvedValue([mockUser] as any);
    vi.mocked(prisma.user.count).mockResolvedValue(1);

    const result = await getAdminUsers({});

    expect(result.users).toHaveLength(1);
    expect(result.totalCount).toBe(1);
    expect(result.totalPages).toBe(1);
  });

  it("filtra por role si se especifica", async () => {
    vi.mocked(prisma.user.findMany).mockResolvedValue([] as any);
    vi.mocked(prisma.user.count).mockResolvedValue(0);

    await getAdminUsers({ role: "admin" });

    expect(prisma.user.findMany).toHaveBeenCalledWith(
      expect.objectContaining({
        where: expect.objectContaining({ role: "admin" }),
      }),
    );
  });

  it("ordena por name asc cuando sort=name-asc", async () => {
    vi.mocked(prisma.user.findMany).mockResolvedValue([] as any);
    vi.mocked(prisma.user.count).mockResolvedValue(0);

    await getAdminUsers({ sort: "name-asc" });

    expect(prisma.user.findMany).toHaveBeenCalledWith(
      expect.objectContaining({ orderBy: { name: "asc" } }),
    );
  });

  it("ordena por createdAt desc cuando sort=createdAt-desc", async () => {
    vi.mocked(prisma.user.findMany).mockResolvedValue([] as any);
    vi.mocked(prisma.user.count).mockResolvedValue(0);

    await getAdminUsers({ sort: "createdAt-desc" });

    expect(prisma.user.findMany).toHaveBeenCalledWith(
      expect.objectContaining({ orderBy: { createdAt: "desc" } }),
    );
  });

  it("calcula paginación correctamente", async () => {
    vi.mocked(prisma.user.findMany).mockResolvedValue([] as any);
    vi.mocked(prisma.user.count).mockResolvedValue(30);

    const result = await getAdminUsers({ page: 2, limit: 10 });

    expect(result.totalPages).toBe(3);
    expect(prisma.user.findMany).toHaveBeenCalledWith(
      expect.objectContaining({ skip: 10, take: 10 }),
    );
  });

  it("devuelve 0 páginas si no hay usuarios", async () => {
    vi.mocked(prisma.user.findMany).mockResolvedValue([] as any);
    vi.mocked(prisma.user.count).mockResolvedValue(0);

    const result = await getAdminUsers({});

    expect(result.totalPages).toBe(0);
    expect(result.totalCount).toBe(0);
  });
});

// ─── getAdminUserDetails ──────────────────────────────────────────────────────

describe("getAdminUserDetails", () => {
  it("devuelve el usuario con sus estadísticas", async () => {
    vi.mocked(prisma.user.findUnique).mockResolvedValue(mockUser as any);
    vi.mocked(prisma.order.aggregate).mockResolvedValue({
      _sum: { totalMinor: 5000 },
    } as any);

    const result = await getAdminUserDetails("user-1");

    expect(result).toMatchObject({
      user: mockUser,
      stats: {
        totalOrders: 2,
        totalSpentMinor: 5000,
      },
    });
  });

  it("devuelve null si el usuario no existe", async () => {
    vi.mocked(prisma.user.findUnique).mockResolvedValue(null);

    const result = await getAdminUserDetails("no-existe");

    expect(result).toBeNull();
    expect(prisma.order.aggregate).not.toHaveBeenCalled();
  });

  it("totalSpentMinor es 0 si aggregate devuelve null", async () => {
    vi.mocked(prisma.user.findUnique).mockResolvedValue(mockUser as any);
    vi.mocked(prisma.order.aggregate).mockResolvedValue({
      _sum: { totalMinor: null },
    } as any);

    const result = await getAdminUserDetails("user-1");

    expect(result?.stats.totalSpentMinor).toBe(0);
  });
});
