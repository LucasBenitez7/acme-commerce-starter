import type { ProductImage } from "@/lib/products/types";
import type {
  Order,
  OrderItem,
  OrderHistory,
  User,
  PaymentStatus,
  FulfillmentStatus,
  Product,
} from "@prisma/client";

type OrderLinkedImage = Pick<ProductImage, "url" | "color">;

type OrderLinkedProduct = Pick<Product, "slug"> & {
  images: OrderLinkedImage[];
  compareAtPrice: number | null;
};

export type OrderActionActor = "user" | "admin" | "system";

// SECCIÓN 1: ADMIN (Listados y Detalles)
export type AdminOrderListItem = {
  id: string;
  createdAt: Date;

  paymentStatus: PaymentStatus;
  fulfillmentStatus: FulfillmentStatus;
  isCancelled: boolean;

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
  history?: { snapshotStatus: string }[];
};

export type AdminOrderDetail = Order & {
  items: (OrderItem & {
    currentStock?: number;
    product: {
      images: OrderLinkedImage[];
      compareAtPrice: number | null;
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

// SECCIÓN 2: USER (Listados)
export type UserOrderListItem = {
  id: string;
  createdAt: Date;

  paymentStatus: PaymentStatus;
  fulfillmentStatus: FulfillmentStatus;
  isCancelled: boolean;

  totalMinor: number;
  currency: string;
  priceMinorSnapshot?: number;
  quantityReturned?: number;

  deliveredAt: Date | null;

  items: {
    id: string;
    quantity: number;
    nameSnapshot: string;
    sizeSnapshot: string | null;
    colorSnapshot: string | null;
    product?: OrderLinkedProduct | null;
  }[];
};

export type UserOrderDetail = Order & {
  items: (OrderItem & {
    product: OrderLinkedProduct | null;
  })[];
  history: OrderHistory[];
  summary: {
    originalQty: number;
    returnedQty: number;
    refundedAmountMinor: number;
    netTotalMinor: number;
  };
};

// SECCIÓN 3: GESTIÓN DE DEVOLUCIONES
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

export type UserReturnableItem = {
  id: string;
  nameSnapshot: string;
  sizeSnapshot: string | null;
  colorSnapshot: string | null;
  maxQuantity: number;
  image?: string;
};

// SECCIÓN 4: UTILIDADES Y PARAMS
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

  sort?: string;
  query?: string;

  statusTab?: string;
  paymentFilter?: PaymentStatus[];
  fulfillmentFilter?: FulfillmentStatus[];
};

// SECCIÓN 5: VISUALIZACIÓN (Order Display)
export interface OrderDisplayData {
  id: string;
  userId: string | null;
  email: string;
  createdAt: Date | string;
  paymentStatus: string;
  fulfillmentStatus: string;
  isCancelled: boolean;
  currency: string;
  paymentMethod: string | null;
  contact: {
    name: string;
    email: string;
    phone: string;
  };
  shippingInfo: {
    label: string;
    addressLines: string[];
  };
  items: {
    id: string;
    name: string;
    slug: string;
    subtitle: string;
    quantity: number;
    price: number;
    compareAtPrice?: number;
    image: string | null;
  }[];
  totals: {
    subtotal: number;
    shipping: number;
    tax: number;
    total: number;
    refunded?: number;
    originalSubtotal?: number;
    totalDiscount?: number;
  };
}
