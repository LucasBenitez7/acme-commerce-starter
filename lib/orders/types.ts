// lib/orders/types.ts
import type {
  Order,
  OrderItem,
  OrderHistory,
  User,
  OrderStatus,
} from "@prisma/client";

// --- DTO: Elemento de la lista (Tabla Admin) ---
export type AdminOrderListItem = {
  id: string;
  createdAt: Date;
  status: OrderStatus;
  totalMinor: number;
  currency: string;
  user: {
    name: string | null;
    email: string | null;
    image?: string | null;
  } | null;
  guestInfo: {
    firstName: string | null;
    lastName: string | null;
    email: string;
  };
  itemsCount: number;
  refundedAmountMinor: number;
  netTotalMinor: number;
};

export type AdminOrderDetail = Order & {
  items: (OrderItem & {
    currentStock?: number;
    product: {
      images: {
        url: string;
        color: string | null;
      }[];
    } | null;
  })[];
  user: User | null;
  history: OrderHistory[];
  summary: {
    originalQty: number;
    returnedQty: number;
    refundedAmountMinor: number;
    netTotalMinor: number;
  };
};

export type HistoryItemJson = {
  name: string;
  quantity: number;
  variant?: string | null;
};

export type HistoryDetailsJson = {
  items?: HistoryItemJson[];
  note?: string;
};

export type GetOrdersParams = {
  page?: number;
  limit?: number;
  statusTab?: string;
  statusFilter?: OrderStatus[];
  sort?: string;
  query?: string;
};

// --- Tipo específico para la UI de devoluciones ---
export type ReturnableItem = {
  id: string;
  nameSnapshot: string;
  sizeSnapshot: string | null;
  colorSnapshot: string | null;
  quantity: number;
  quantityReturned: number;
  quantityReturnRequested: number;
  image?: string;
};
