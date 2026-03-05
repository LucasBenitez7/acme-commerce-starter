import { renderHook, act, waitFor } from "@testing-library/react";
import { useRouter } from "next/navigation";
import { useSession } from "next-auth/react";
import { describe, it, expect, beforeEach, vi } from "vitest";

import { validateStockAction } from "@/app/(site)/(shop)/cart/actions";
import { useCartLogic } from "@/hooks/cart/use-cart-logic";
import { useCartStore, type CartItem } from "@/store/cart";

// ─── Mocks específicos de este hook ──────────────────────────────────────────
const mockPush = vi.fn();
vi.mocked(useRouter).mockReturnValue({
  push: mockPush,
  replace: vi.fn(),
  refresh: vi.fn(),
  back: vi.fn(),
  prefetch: vi.fn(),
} as any);

// Mock de next-auth/react
vi.mock("next-auth/react", () => ({
  useSession: vi.fn(),
}));

// Mock de validateStockAction
vi.mock("@/app/(site)/(shop)/cart/actions", () => ({
  validateStockAction: vi.fn(),
}));

const mockValidateStock = vi.mocked(validateStockAction);

// ─── Helpers ─────────────────────────────────────────────────────────────────
const makeItem = (overrides: Partial<CartItem> = {}): CartItem => ({
  productId: "prod_1",
  variantId: "var_1",
  slug: "camiseta-roja",
  name: "Camiseta Roja",
  price: 1999,
  color: "Rojo",
  size: "M",
  quantity: 2,
  maxStock: 10,
  ...overrides,
});

beforeEach(() => {
  useCartStore.setState({ items: [], removedItems: [], isOpen: false });
  localStorage.clear();
  vi.clearAllMocks();
  // Por defecto: sin sesión
  vi.mocked(useSession).mockReturnValue({
    data: null,
    status: "unauthenticated",
    update: vi.fn(),
  });
});

// ─── Estado inicial ────────────────────────────────────────────────────────────
describe("useCartLogic - estado inicial", () => {
  it("empieza con carrito vacío", async () => {
    const { result } = renderHook(() => useCartLogic());
    await waitFor(() => expect(result.current.items).toBeDefined());
    expect(result.current.items).toHaveLength(0);
    expect(result.current.hasItems).toBe(false);
    expect(result.current.totalQty).toBe(0);
    expect(result.current.totalPrice).toBe(0);
  });

  it("refleja items del store cuando tiene productos", async () => {
    useCartStore.getState().addItem(makeItem());

    const { result } = renderHook(() => useCartLogic());
    await waitFor(() => expect(result.current.items.length).toBeGreaterThan(0));

    expect(result.current.items).toHaveLength(1);
    expect(result.current.hasItems).toBe(true);
    expect(result.current.totalQty).toBe(2);
    expect(result.current.totalPrice).toBe(3998); // 1999 * 2
  });
});

// ─── handleUpdateQuantity ─────────────────────────────────────────────────────
describe("handleUpdateQuantity", () => {
  it("actualiza la cantidad en el store", async () => {
    useCartStore.getState().addItem(makeItem({ quantity: 1 }));

    const { result } = renderHook(() => useCartLogic());
    await waitFor(() => expect(result.current.items.length).toBeGreaterThan(0));

    act(() => {
      result.current.handleUpdateQuantity("var_1", 4);
    });

    expect(useCartStore.getState().items[0].quantity).toBe(4);
  });

  it("limpia el stockError si el carrito queda válido tras actualizar", async () => {
    useCartStore.getState().addItem(makeItem({ quantity: 5, maxStock: 3 }));

    const { result } = renderHook(() => useCartLogic());
    await waitFor(() => expect(result.current.items.length).toBeGreaterThan(0));

    // Simulamos que hay un stock error
    mockValidateStock.mockResolvedValueOnce({
      success: false,
      error: "Stock insuficiente",
    });

    await act(async () => {
      await result.current.handleCheckout();
    });

    expect(result.current.stockError).toBe("Stock insuficiente");

    // Actualizamos a una cantidad válida
    act(() => {
      result.current.handleUpdateQuantity("var_1", 2);
    });

    await waitFor(() => expect(result.current.stockError).toBeNull());
  });
});

// ─── handleRemoveItem ─────────────────────────────────────────────────────────
describe("handleRemoveItem", () => {
  it("elimina el item del store", async () => {
    useCartStore.getState().addItem(makeItem());

    const { result } = renderHook(() => useCartLogic());
    await waitFor(() => expect(result.current.items.length).toBeGreaterThan(0));

    act(() => {
      result.current.handleRemoveItem("var_1");
    });

    expect(useCartStore.getState().items).toHaveLength(0);
  });

  it("limpia stockError si tras eliminar el carrito queda válido", async () => {
    useCartStore.getState().addItem(makeItem({ quantity: 1, maxStock: 1 }));

    const { result } = renderHook(() => useCartLogic());
    await waitFor(() => expect(result.current.items.length).toBeGreaterThan(0));

    mockValidateStock.mockResolvedValueOnce({
      success: false,
      error: "Stock insuficiente",
    });

    await act(async () => {
      await result.current.handleCheckout();
    });

    expect(result.current.stockError).toBe("Stock insuficiente");

    act(() => {
      result.current.handleRemoveItem("var_1");
    });

    await waitFor(() => expect(result.current.stockError).toBeNull());
  });
});

// ─── handleCheckout ───────────────────────────────────────────────────────────
describe("handleCheckout", () => {
  it("no hace nada si el carrito está vacío", async () => {
    const { result } = renderHook(() => useCartLogic());
    await waitFor(() => expect(result.current.items).toBeDefined());

    await act(async () => {
      await result.current.handleCheckout();
    });

    expect(mockValidateStock).not.toHaveBeenCalled();
    expect(mockPush).not.toHaveBeenCalled();
  });

  it("redirige a /checkout si hay sesión y el stock es válido", async () => {
    vi.mocked(useSession).mockReturnValue({
      data: { user: { id: "user_1", email: "user@test.com" } },
      status: "authenticated",
      update: vi.fn(),
    } as any);

    useCartStore.getState().addItem(makeItem());
    mockValidateStock.mockResolvedValue({ success: true });

    const { result } = renderHook(() => useCartLogic());
    await waitFor(() => expect(result.current.items.length).toBeGreaterThan(0));

    await act(async () => {
      await result.current.handleCheckout();
    });

    expect(mockPush).toHaveBeenCalledWith("/checkout");
  });

  it("redirige a login con redirectTo si no hay sesión", async () => {
    vi.mocked(useSession).mockReturnValue({
      data: null,
      status: "unauthenticated",
      update: vi.fn(),
    } as any);

    useCartStore.getState().addItem(makeItem());
    mockValidateStock.mockResolvedValue({ success: true });

    const { result } = renderHook(() => useCartLogic());
    await waitFor(() => expect(result.current.items.length).toBeGreaterThan(0));

    await act(async () => {
      await result.current.handleCheckout();
    });

    expect(mockPush).toHaveBeenCalledWith("/auth/login?redirectTo=/checkout");
  });

  it("muestra stockError y no redirige si falla la validación", async () => {
    useCartStore.getState().addItem(makeItem());
    mockValidateStock.mockResolvedValue({
      success: false,
      error: "Stock insuficiente para Camiseta Roja",
    });

    const { result } = renderHook(() => useCartLogic());
    await waitFor(() => expect(result.current.items.length).toBeGreaterThan(0));

    await act(async () => {
      await result.current.handleCheckout();
    });

    expect(result.current.stockError).toBe(
      "Stock insuficiente para Camiseta Roja",
    );
    expect(mockPush).not.toHaveBeenCalled();
  });

  it("llama a syncMaxStock cuando el error incluye stockUpdate", async () => {
    useCartStore.getState().addItem(makeItem({ maxStock: 10 }));
    mockValidateStock.mockResolvedValue({
      success: false,
      error: "Stock insuficiente",
      stockUpdate: { variantId: "var_1", realStock: 2 },
    });

    const { result } = renderHook(() => useCartLogic());
    await waitFor(() => expect(result.current.items.length).toBeGreaterThan(0));

    await act(async () => {
      await result.current.handleCheckout();
    });

    // El store debe haber actualizado el maxStock
    expect(useCartStore.getState().items[0].maxStock).toBe(2);
  });

  it("cierra el carrito antes de redirigir al checkout", async () => {
    vi.mocked(useSession).mockReturnValue({
      data: { user: { id: "user_1" } },
      status: "authenticated",
      update: vi.fn(),
    } as any);

    useCartStore.getState().addItem(makeItem());
    useCartStore.getState().openCart();
    mockValidateStock.mockResolvedValue({ success: true });

    const { result } = renderHook(() => useCartLogic());
    await waitFor(() => expect(result.current.items.length).toBeGreaterThan(0));

    await act(async () => {
      await result.current.handleCheckout();
    });

    expect(useCartStore.getState().isOpen).toBe(false);
  });
});
