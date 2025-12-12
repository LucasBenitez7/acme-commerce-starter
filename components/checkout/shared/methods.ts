import { type IconType } from "react-icons";
import { FaCreditCard } from "react-icons/fa6";
import { GiTakeMyMoney } from "react-icons/gi";
import { GrTransaction } from "react-icons/gr";
import { LuSmartphoneNfc } from "react-icons/lu";

type PaymentMethodId = "card" | "bizum" | "transfer" | "cash";

export type PaymentMethodOption = {
  id: PaymentMethodId;
  title: string;
  description: string;
  icon?: IconType;
};

export const PAYMENT_METHOD_OPTIONS: PaymentMethodOption[] = [
  {
    id: "card",
    title: "Tarjeta de crédito o débito",
    description: "Pago seguro online con tu tarjeta",
    icon: FaCreditCard,
  },
  {
    id: "bizum",
    title: "Bizum",
    description: "Paga desde la app de tu banco en segundos",
    icon: LuSmartphoneNfc,
  },
  {
    id: "transfer",
    title: "Transferencia bancaria",
    description: "Te daremos los datos bancarios al confirmar el pedido",
    icon: GrTransaction,
  },
  {
    id: "cash",
    title: "Pago en efectivo al recoger",
    description: "Paga en tienda cuando recojas tu pedido",
    icon: GiTakeMyMoney,
  },
];

export type PaymentMethod = PaymentMethodId;

export function isPaymentMethod(value: unknown): value is PaymentMethod {
  return (
    typeof value === "string" &&
    PAYMENT_METHOD_OPTIONS.some((method) => method.id === value)
  );
}

export function findPaymentMethod(id?: string | null) {
  if (!id) return undefined;
  return PAYMENT_METHOD_OPTIONS.find((method) => method.id === id);
}
