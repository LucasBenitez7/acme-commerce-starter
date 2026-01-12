import { type OrderStatus } from "@prisma/client";

// --- STATUS CONFIG (Centralizado) ---
export const ORDER_STATUS_CONFIG: Record<
  OrderStatus,
  { label: string; color: string; badge: string }
> = {
  PAID: {
    label: "Pagado",
    color: "bg-green-500",
    badge: "bg-green-100 text-green-800 border-green-200",
  },
  PENDING_PAYMENT: {
    label: "Pendiente",
    color: "bg-yellow-500",
    badge: "bg-yellow-100 text-yellow-800 border-yellow-200",
  },
  CANCELLED: {
    label: "Cancelado",
    color: "bg-neutral-500",
    badge: "bg-neutral-100 text-neutral-800 border-neutral-200",
  },
  EXPIRED: {
    label: "Expirado",
    color: "bg-neutral-400",
    badge: "bg-neutral-100 text-neutral-600 border-neutral-200",
  },
  RETURN_REQUESTED: {
    label: "Devolución Solicitada",
    color: "bg-orange-500",
    badge: "bg-orange-100 text-orange-800 border-orange-200 animate-pulse",
  },
  RETURNED: {
    label: "Devuelto",
    color: "bg-blue-500",
    badge: "bg-blue-100 text-blue-800 border-blue-200",
  },
};

// --- HELPERS ---
export function getStatusBadgeStyle(status: string) {
  return (
    ORDER_STATUS_CONFIG[status as OrderStatus]?.badge ||
    "bg-gray-100 text-gray-800"
  );
}

export function getStatusColor(status: string) {
  return ORDER_STATUS_CONFIG[status as OrderStatus]?.color || "bg-gray-500";
}

// Para el filtro del Toolbar
export const FILTER_STATUS_OPTIONS = Object.entries(ORDER_STATUS_CONFIG).map(
  ([value, config]) => ({
    value,
    label: config.label,
    color: config.color,
  }),
);

// --- SORTING ---
export const ORDER_SORT_OPTIONS = [
  { label: "Fecha: Reciente", value: "date_desc" },
  { label: "Fecha: Antigua", value: "date_asc" },
  { label: "Total: Alto a Bajo", value: "total_desc" },
  { label: "Total: Bajo a Alto", value: "total_asc" },
];

// --- REASONS ---
export const RETURN_REASONS = [
  "No me queda bien la talla",
  "El producto es diferente a la foto",
  "Llegó dañado o defectuoso",
  "Me equivoqué al pedirlo",
  "Ya no lo quiero",
  "Otro motivo",
];

export const REJECTION_REASONS = [
  "El producto está usado o sin etiquetas",
  "Fuera del plazo de devolución",
  "No se aprecian los daños mencionados",
  "El producto no corresponde con el pedido original",
  "Otro motivo",
];
