"use client";

import { useFormContext } from "react-hook-form";
import { FaCcVisa, FaCcMastercard } from "react-icons/fa";
import { FaCreditCard, FaBuildingColumns, FaLock } from "react-icons/fa6";

import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Label } from "@/components/ui/label";
import { RadioGroup, RadioGroupItem } from "@/components/ui/radio-group";

import { type CheckoutFormValues } from "@/lib/checkout/schema";

type Props = {
  isOpen: boolean;
};

export function PaymentSection({ isOpen = false }: Props) {
  const {
    setValue,
    watch,
    formState: { errors },
  } = useFormContext<CheckoutFormValues>();
  const paymentMethod = watch("paymentMethod");

  return (
    <Card
      className={`p-4 transition-all duration-300 ${!isOpen ? "bg-neutral-50/50" : "bg-white"}`}
    >
      <CardHeader className="px-0 pt-2">
        <CardTitle
          className={`text-base flex items-center gap-2 transition-colors ${!isOpen ? "text-muted-foreground" : "text-foreground"}`}
        >
          <FaCreditCard className="text-muted-foreground" /> Método de pago
        </CardTitle>
      </CardHeader>

      <div
        className={`grid transition-all duration-300 ease-in-out ${isOpen ? "grid-rows-[1fr] opacity-100 mt-2" : "grid-rows-[0fr] opacity-0"}`}
      >
        <div className="overflow-hidden">
          <CardContent className="px-0 space-y-4">
            <RadioGroup
              value={paymentMethod}
              onValueChange={(val) =>
                setValue("paymentMethod", val as "card" | "transfer", {
                  shouldValidate: true,
                })
              }
              className="grid grid-cols-1 gap-3"
            >
              {/* --- OPCIÓN 1: TARJETA --- */}
              <div
                className={`relative flex flex-col border rounded-xs p-4 transition-all duration-200 ${
                  paymentMethod === "card"
                    ? "border-foreground"
                    : "border-border bg-neutral-50 hover:border-foreground"
                }`}
              >
                <div className="flex items-center gap-4 w-full">
                  <RadioGroupItem value="card" id="pm-card" />

                  <div className="flex-1">
                    <Label
                      htmlFor="pm-card"
                      className="font-semibold cursor-pointer text-sm flex items-center justify-between w-full"
                    >
                      <span>Tarjeta de Crédito / Débito</span>
                      <div className="flex gap-2">
                        <FaCcVisa className="size-6" />
                        <FaCcMastercard className="size-6" />
                      </div>
                    </Label>
                    <p className="text-xs text-muted-foreground mt-1 ml-0.5">
                      Pago seguro inmediato.
                    </p>
                  </div>
                </div>

                {paymentMethod === "card" && (
                  <div className="mt-3 pt-3 border-t flex items-start gap-2 text-xs text-blue-600 animate-in fade-in slide-in-from-top-1">
                    <FaLock className="mt-0.5 shrink-0" />
                    <span>
                      <strong>Entorno seguro.</strong> Modo simulación (no se
                      cobrará nada).
                    </span>
                  </div>
                )}

                <Label
                  htmlFor="pm-card"
                  className="absolute inset-0 cursor-pointer"
                  aria-hidden="true"
                />
              </div>

              {/* --- OPCIÓN 2: TRANSFERENCIA --- */}
              <div
                className={`relative flex flex-col border rounded-xs p-4 transition-all duration-200 ${
                  paymentMethod === "transfer"
                    ? "border-foreground"
                    : "border-border bg-neutral-50 hover:border-foreground"
                }`}
              >
                <div className="flex items-center gap-4 w-full">
                  <RadioGroupItem value="transfer" id="pm-transfer" />

                  <div className="flex-1">
                    <Label
                      htmlFor="pm-transfer"
                      className="font-semibold cursor-pointer text-sm flex items-center gap-2 w-full"
                    >
                      Transferencia Bancaria
                    </Label>
                    <p className="text-xs text-muted-foreground mt-1 ml-0.5">
                      Procesamiento tras recibir el pago.
                    </p>
                  </div>
                  <FaBuildingColumns className="size-5" />
                </div>

                {paymentMethod === "transfer" && (
                  <div className="mt-3 pt-3 border-t text-xs text-neutral-600 animate-in fade-in slide-in-from-top-1">
                    <p>Recibirás el IBAN por email al completar el pedido.</p>
                  </div>
                )}

                <Label
                  htmlFor="pm-transfer"
                  className="absolute inset-0 cursor-pointer"
                  aria-hidden="true"
                />
              </div>
            </RadioGroup>

            {errors.paymentMethod && (
              <p className="text-xs text-red-500 font-medium">
                Selecciona un método de pago.
              </p>
            )}
          </CardContent>
        </div>
      </div>
    </Card>
  );
}
