import { describe, it, expect, vi } from "vitest";

// ─── Mock de dependencias externas ───────────────────────────────────────────
vi.mock("@/lib/locations", () => ({
  getShippingLabel: vi.fn((type: string) => {
    const map: Record<string, string> = {
      home: "Envío a domicilio",
      store: "Recogida en tienda",
      pickup: "Punto de recogida",
    };
    return map[type] ?? "Envío";
  }),
  findStoreLocation: vi.fn(),
  findPickupLocation: vi.fn(),
}));

// ─── orders/constants importa de @prisma/client, así que mockeamos Prisma ────
vi.mock("@prisma/client", () => ({
  PaymentStatus: {
    PAID: "PAID",
    PENDING: "PENDING",
    REFUNDED: "REFUNDED",
    PARTIALLY_REFUNDED: "PARTIALLY_REFUNDED",
    FAILED: "FAILED",
  },
  FulfillmentStatus: {
    UNFULFILLED: "UNFULFILLED",
    PREPARING: "PREPARING",
    READY_FOR_PICKUP: "READY_FOR_PICKUP",
    SHIPPED: "SHIPPED",
    DELIVERED: "DELIVERED",
    RETURNED: "RETURNED",
  },
  ShippingType: {
    HOME: "HOME",
    STORE: "STORE",
    PICKUP: "PICKUP",
  },
}));

vi.mock("react-icons/fa6", () => ({
  FaUser: "FaUser",
  FaUserShield: "FaUserShield",
  FaTriangleExclamation: "FaTriangleExclamation",
  FaCheck: "FaCheck",
  FaBan: "FaBan",
}));

// ─── Importamos las constantes REALES para que los valores string sean exactos
import { SYSTEM_MSGS, SPECIAL_STATUS_CONFIG } from "@/lib/orders/constants";
import {
  formatHistoryReason,
  canOrderBeReturned,
  shouldShowHistoryButton,
  calculateDiscounts,
  getReturnableItems,
  getReturnStatusBadge,
  getOrderCancellationDetails,
  getOrderCancellationDetailsUser,
} from "@/lib/orders/utils";

// ─── formatHistoryReason ──────────────────────────────────────────────────────
describe("formatHistoryReason", () => {
  it("devuelve texto mapeado para ORDER_CREATED", () => {
    expect(formatHistoryReason(SYSTEM_MSGS.ORDER_CREATED)).toBe(
      "Pedido realizado con éxito",
    );
  });

  it("devuelve texto mapeado para CANCELLED_BY_USER", () => {
    expect(formatHistoryReason(SYSTEM_MSGS.CANCELLED_BY_USER)).toBe(
      "Cancelaste el pedido",
    );
  });

  it("devuelve texto mapeado para CANCELLED_BY_ADMIN", () => {
    expect(formatHistoryReason(SYSTEM_MSGS.CANCELLED_BY_ADMIN)).toBe(
      "Cancelado por administración",
    );
  });

  it("devuelve texto mapeado para ORDER_EXPIRED", () => {
    expect(formatHistoryReason(SYSTEM_MSGS.ORDER_EXPIRED)).toBe(
      "Expirado por falta de pago (Tiempo límite excedido)",
    );
  });

  it("devuelve texto mapeado para RETURN_ACCEPTED", () => {
    expect(formatHistoryReason(SYSTEM_MSGS.RETURN_ACCEPTED)).toBe(
      "Reembolso procesado",
    );
  });

  it("devuelve texto mapeado para RETURN_REJECTED", () => {
    expect(formatHistoryReason(SYSTEM_MSGS.RETURN_REJECTED)).toBe(
      "Solicitud de devolución rechazada",
    );
  });

  it("devuelve el mismo string si no está en el mapa", () => {
    expect(formatHistoryReason("Texto personalizado")).toBe(
      "Texto personalizado",
    );
  });

  it("devuelve texto por defecto para null/undefined", () => {
    expect(formatHistoryReason(null)).toBe("Evento registrado");
    expect(formatHistoryReason(undefined)).toBe("Evento registrado");
  });
});

// ─── canOrderBeReturned ───────────────────────────────────────────────────────
describe("canOrderBeReturned", () => {
  it("devuelve true para pedido pagado y entregado no cancelado", () => {
    expect(
      canOrderBeReturned({
        paymentStatus: "PAID",
        fulfillmentStatus: "DELIVERED",
        isCancelled: false,
      }),
    ).toBe(true);
  });

  it("devuelve false si el pedido está cancelado", () => {
    expect(
      canOrderBeReturned({
        paymentStatus: "PAID",
        fulfillmentStatus: "DELIVERED",
        isCancelled: true,
      }),
    ).toBe(false);
  });

  it("devuelve false si el pago no es PAID", () => {
    expect(
      canOrderBeReturned({
        paymentStatus: "PENDING",
        fulfillmentStatus: "DELIVERED",
        isCancelled: false,
      }),
    ).toBe(false);
  });

  it("devuelve false si el fulfillment no es DELIVERED", () => {
    expect(
      canOrderBeReturned({
        paymentStatus: "PAID",
        fulfillmentStatus: "PENDING",
        isCancelled: false,
      }),
    ).toBe(false);
  });
});

// ─── shouldShowHistoryButton ──────────────────────────────────────────────────
describe("shouldShowHistoryButton", () => {
  it("devuelve true si hay reembolso completo", () => {
    expect(
      shouldShowHistoryButton({
        paymentStatus: "REFUNDED",
        isCancelled: false,
      }),
    ).toBe(true);
  });

  it("devuelve true si hay reembolso parcial", () => {
    expect(
      shouldShowHistoryButton({
        paymentStatus: "PARTIALLY_REFUNDED",
        isCancelled: false,
      }),
    ).toBe(true);
  });

  it("devuelve true si hay returnReason activo", () => {
    expect(
      shouldShowHistoryButton({
        paymentStatus: "PAID",
        returnReason: "Producto defectuoso",
        isCancelled: false,
      }),
    ).toBe(true);
  });

  it("devuelve true si hay incidentes en el historial y no está cancelado", () => {
    expect(
      shouldShowHistoryButton({
        paymentStatus: "PAID",
        history: [{ type: "INCIDENT" }],
        isCancelled: false,
      }),
    ).toBe(true);
  });

  it("devuelve false para pedido normal sin incidentes", () => {
    expect(
      shouldShowHistoryButton({
        paymentStatus: "PAID",
        isCancelled: false,
        history: [],
      }),
    ).toBe(false);
  });
});

// ─── calculateDiscounts ───────────────────────────────────────────────────────
describe("calculateDiscounts", () => {
  it("usa compareAtPrice cuando es mayor que el precio actual", () => {
    const items = [
      {
        priceMinorSnapshot: 1000,
        quantity: 2,
        product: { compareAtPrice: 1500 },
      },
    ];
    expect(calculateDiscounts(items)).toBe(3000); // 1500 * 2
  });

  it("usa priceMinorSnapshot cuando compareAtPrice es null", () => {
    const items = [
      {
        priceMinorSnapshot: 1000,
        quantity: 3,
        product: { compareAtPrice: null },
      },
    ];
    expect(calculateDiscounts(items)).toBe(3000);
  });

  it("usa priceMinorSnapshot cuando compareAtPrice es menor", () => {
    const items = [
      {
        priceMinorSnapshot: 1500,
        quantity: 1,
        product: { compareAtPrice: 1000 },
      },
    ];
    expect(calculateDiscounts(items)).toBe(1500);
  });

  it("suma múltiples items correctamente", () => {
    const items = [
      {
        priceMinorSnapshot: 1000,
        quantity: 2,
        product: { compareAtPrice: null },
      },
      {
        priceMinorSnapshot: 500,
        quantity: 1,
        product: { compareAtPrice: null },
      },
    ];
    expect(calculateDiscounts(items)).toBe(2500);
  });

  it("devuelve 0 para array vacío", () => {
    expect(calculateDiscounts([])).toBe(0);
  });
});

// ─── getReturnableItems ───────────────────────────────────────────────────────
describe("getReturnableItems", () => {
  it("devuelve items que se pueden devolver", () => {
    const order = {
      items: [
        {
          id: "item1",
          nameSnapshot: "Camiseta",
          sizeSnapshot: "M",
          colorSnapshot: "Rojo",
          quantity: 2,
          quantityReturned: 0,
          quantityReturnRequested: 0,
          product: { images: [{ url: "img.jpg", color: "Rojo" }] },
        },
      ],
    } as any;
    const result = getReturnableItems(order);
    expect(result).toHaveLength(1);
    expect(result[0].maxQuantity).toBe(2);
  });

  it("excluye items ya devueltos completamente", () => {
    const order = {
      items: [
        {
          id: "item1",
          nameSnapshot: "Camiseta",
          sizeSnapshot: "M",
          colorSnapshot: "Rojo",
          quantity: 1,
          quantityReturned: 1,
          quantityReturnRequested: 0,
          product: { images: [] },
        },
      ],
    } as any;
    expect(getReturnableItems(order)).toHaveLength(0);
  });

  it("calcula maxQuantity restando devueltos y solicitados", () => {
    const order = {
      items: [
        {
          id: "item1",
          nameSnapshot: "Pantalón",
          sizeSnapshot: "L",
          colorSnapshot: "Azul",
          quantity: 3,
          quantityReturned: 1,
          quantityReturnRequested: 1,
          product: { images: [{ url: "img.jpg", color: "Azul" }] },
        },
      ],
    } as any;
    expect(getReturnableItems(order)[0].maxQuantity).toBe(1); // 3 - 1 - 1
  });
});

// ─── getReturnStatusBadge ─────────────────────────────────────────────────────
describe("getReturnStatusBadge", () => {
  it("devuelve badge Reembolsado para REFUNDED", () => {
    expect(
      getReturnStatusBadge({
        paymentStatus: "REFUNDED",
        fulfillmentStatus: "DELIVERED",
      })?.label,
    ).toBe("Reembolsado");
  });

  it("devuelve badge Reembolsado para PARTIALLY_REFUNDED", () => {
    expect(
      getReturnStatusBadge({
        paymentStatus: "PARTIALLY_REFUNDED",
        fulfillmentStatus: "DELIVERED",
      })?.label,
    ).toBe("Reembolsado");
  });

  it("devuelve badge Devuelto para RETURNED", () => {
    expect(
      getReturnStatusBadge({
        paymentStatus: "PAID",
        fulfillmentStatus: "RETURNED",
      })?.label,
    ).toBe("Devuelto");
  });

  it("devuelve badge Solicitud Pendiente si hay request sin cerrar", () => {
    const result = getReturnStatusBadge({
      paymentStatus: "PAID",
      fulfillmentStatus: "DELIVERED",
      history: [{ snapshotStatus: SYSTEM_MSGS.RETURN_REQUESTED }],
    });
    expect(result?.label).toBe("Solicitud Pendiente");
  });

  it("devuelve null para pedido normal", () => {
    expect(
      getReturnStatusBadge({
        paymentStatus: "PAID",
        fulfillmentStatus: "DELIVERED",
        history: [],
      }),
    ).toBeNull();
  });
});

// ─── getOrderCancellationDetails ─────────────────────────────────────────────
describe("getOrderCancellationDetails", () => {
  it("devuelve null si el pedido no está cancelado", () => {
    expect(
      getOrderCancellationDetails({ isCancelled: false, history: [] }),
    ).toBeNull();
  });

  it("detecta cancelación por usuario", () => {
    const result = getOrderCancellationDetails({
      isCancelled: true,
      history: [
        {
          snapshotStatus: SPECIAL_STATUS_CONFIG.CANCELLED.label,
          actor: "user",
          reason: SYSTEM_MSGS.CANCELLED_BY_USER,
          createdAt: new Date(),
        },
      ],
    });
    expect(result?.bannerTitle).toContain("el Cliente");
    expect(result?.isExpired).toBe(false);
  });

  it("detecta pedido expirado", () => {
    const result = getOrderCancellationDetails({
      isCancelled: true,
      history: [
        {
          snapshotStatus: SPECIAL_STATUS_CONFIG.EXPIRED.label,
          actor: "system",
          reason: SYSTEM_MSGS.ORDER_EXPIRED,
          createdAt: new Date(),
        },
      ],
    });
    expect(result?.isExpired).toBe(true);
    expect(result?.bannerTitle).toBe("El pedido ha expirado");
  });
});

// ─── getOrderCancellationDetailsUser ─────────────────────────────────────────
describe("getOrderCancellationDetailsUser", () => {
  it("devuelve null si el pedido no está cancelado", () => {
    expect(
      getOrderCancellationDetailsUser({ isCancelled: false, history: [] }),
    ).toBeNull();
  });

  it("muestra mensaje para usuario que canceló", () => {
    const result = getOrderCancellationDetailsUser({
      isCancelled: true,
      history: [
        {
          snapshotStatus: SPECIAL_STATUS_CONFIG.CANCELLED.label,
          actor: "user",
          reason: SYSTEM_MSGS.CANCELLED_BY_USER,
          createdAt: new Date(),
        },
      ],
    });
    expect(result?.bannerTitle).toBe("Has cancelado este pedido");
  });

  it("muestra mensaje cuando canceló el admin", () => {
    const result = getOrderCancellationDetailsUser({
      isCancelled: true,
      history: [
        {
          snapshotStatus: SPECIAL_STATUS_CONFIG.CANCELLED.label,
          actor: "admin",
          reason: SYSTEM_MSGS.CANCELLED_BY_ADMIN,
          createdAt: new Date(),
        },
      ],
    });
    expect(result?.bannerTitle).toBe("Pedido cancelado por el administrador");
  });
});
