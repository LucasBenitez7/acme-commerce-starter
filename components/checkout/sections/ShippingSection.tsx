"use client";

import { type UserAddress } from "@prisma/client";
import { useState } from "react";
import { useFormContext } from "react-hook-form";
import {
  FaTruck,
  FaPlus,
  FaCheck,
  FaCircleCheck,
  FaMapLocationDot,
} from "react-icons/fa6";
import { toast } from "sonner";

import { Button, Label } from "@/components/ui";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { RadioGroup } from "@/components/ui/radio-group";

import { type CheckoutFormValues } from "@/lib/checkout/schema";
import { SHIPPING_METHODS } from "@/lib/constants";

import { ShippingAddressForm } from "./ShippingAddressForm";

type Props = {
  savedAddresses: UserAddress[];
  selectedAddressId: string;
  setSelectedAddressId: (id: string) => void;
  isAddressConfirmed: boolean;
  onConfirmAddress: () => void;
  onChangeAddress: () => void;
};

export function ShippingSection({
  savedAddresses,
  selectedAddressId,
  setSelectedAddressId,
  isAddressConfirmed,
  onConfirmAddress,
  onChangeAddress,
}: Props) {
  const { setValue, watch } = useFormContext<CheckoutFormValues>();
  const shippingType = watch("shippingType");

  const [isFormOpen, setIsFormOpen] = useState(false);
  const [addressToEdit, setAddressToEdit] = useState<UserAddress | null>(null);
  const [isSelectingMethod, setIsSelectingMethod] = useState(!shippingType);

  const activeMethod = SHIPPING_METHODS.find((m) => m.id === shippingType);

  const handleChangeMethod = () => {
    setIsSelectingMethod(true);
    setValue("shippingType", null as any);
    onChangeAddress();
  };
  const handleSelectMethod = (type: "home" | "store" | "pickup") => {
    setValue("shippingType", type);
    setIsSelectingMethod(false);
    onChangeAddress();
  };
  const handleSelectAddress = (id: string) => {
    if (!isAddressConfirmed) setSelectedAddressId(id);
  };
  const handleEditClick = (e: React.MouseEvent, addr: UserAddress) => {
    e.stopPropagation();
    setAddressToEdit(addr);
    setIsFormOpen(true);
  };
  const handleAddNewClick = () => {
    setAddressToEdit(null);
    setIsFormOpen(true);
  };
  const handleFormSuccess = (updatedAddress: UserAddress) => {
    setIsFormOpen(false);
    toast.success("Dirección guardada");
    setSelectedAddressId(updatedAddress.id);
  };

  return (
    <Card className="p-4">
      <CardHeader className="px-0">
        <div className="flex items-center justify-between">
          <CardTitle className="text-base flex items-center gap-2">
            <FaTruck className="text-muted-foreground" />
            {!isSelectingMethod
              ? "Método de entrega"
              : "Seleccione un método de entrega"}
          </CardTitle>
          {!isSelectingMethod && (
            <Button
              type="button"
              variant="ghost"
              size="sm"
              onClick={handleChangeMethod}
              className="h-auto p-1 px-2 text-xs font-medium rounded-full  hover:bg-neutral-100 active:bg-neutral-200 transition-all duration-200 ease-in-out"
            >
              Cambiar método
            </Button>
          )}
        </div>
      </CardHeader>

      <CardContent className="space-y-6 px-0">
        {/* 1. GRID SELECCIÓN */}
        {isSelectingMethod && (
          <div>
            <RadioGroup
              value={shippingType}
              onValueChange={(val) => handleSelectMethod(val as any)}
              className="grid grid-cols-1 sm:grid-cols-3 gap-4"
            >
              {SHIPPING_METHODS.map((method) => {
                const isSelected = shippingType === method.id;
                const Icon = method.icon;

                return (
                  <div
                    key={method.id}
                    onClick={() => handleSelectMethod(method.id as any)}
                    className="border rounded-xs p-4 py-6 cursor-pointer text-center transition-all hover:border-foreground "
                  >
                    <div className="flex items-center justify-center gap-2 mb-1 font-medium text-sm">
                      <Icon /> {method.label}
                    </div>
                  </div>
                );
              })}
            </RadioGroup>
          </div>
        )}

        {/* 2. CONTENIDO CONFIRMADO/SELECCIONADO */}
        {!isSelectingMethod && activeMethod && (
          <div>
            <div className="mb-5">
              <div className="border rounded-xs p-4 py-3 flex items-center justify-start font-medium text-sm gap-5">
                <FaCircleCheck className="text-foreground size-5" />
                <div className="flex items-center gap-2 h-12">
                  <activeMethod.icon />
                  <span className="mt-[1px]">{activeMethod.label}</span>
                </div>
              </div>
            </div>

            {/* LÓGICA DE DIRECCIONES */}
            {shippingType === "home" && (
              <div className="space-y-4">
                {!isFormOpen ? (
                  <div className="space-y-3">
                    <div className="flex items-center gap-2">
                      <FaMapLocationDot className="text-muted-foreground" />
                      <div className="flex items-center justify-between flex-1">
                        <Label className="text-base font-semibold">
                          {isAddressConfirmed
                            ? "Dirección confirmada"
                            : "Selecciona una dirección"}
                        </Label>
                        {isAddressConfirmed && (
                          <Button
                            type="button"
                            variant="ghost"
                            size="sm"
                            onClick={onChangeAddress}
                            className="h-auto p-1 px-2 text-xs font-medium rounded-full  hover:bg-neutral-100 active:bg-neutral-200 transition-all duration-200 ease-in-out"
                          >
                            Cambiar dirección
                          </Button>
                        )}
                      </div>
                    </div>

                    <div className="grid grid-cols-1 gap-3">
                      {(isAddressConfirmed
                        ? savedAddresses.filter(
                            (a) => a.id === selectedAddressId,
                          )
                        : savedAddresses
                      ).map((addr) => {
                        const isSelected = selectedAddressId === addr.id;

                        const cardClasses = isAddressConfirmed
                          ? "cursor-default"
                          : isSelected
                            ? "border-foreground cursor-pointer"
                            : "border-border hover:border-foreground bg-neutral-50 cursor-pointer";

                        return (
                          <div
                            key={addr.id}
                            onClick={() => handleSelectAddress(addr.id)}
                            className={`relative flex items-center gap-5 border rounded-xs px-4 py-3 transition-all duration-200 ${cardClasses}`}
                          >
                            <div className="shrink-0">
                              {isAddressConfirmed ? (
                                <FaCircleCheck className="text-foreground size-5" />
                              ) : (
                                <div
                                  className={`flex h-4 w-4 items-center justify-center rounded-full border border-primary text-primary ${isSelected ? "" : "opacity-50"}`}
                                >
                                  {isSelected && (
                                    <div className="h-2.5 w-2.5 rounded-full bg-current" />
                                  )}
                                </div>
                              )}
                            </div>

                            <div className="flex-1 font-normal text-sm">
                              <div className="flex items-center justify-between">
                                <span className="text-sm font-semibold">
                                  {addr.firstName} {addr.lastName}
                                </span>
                                {!isAddressConfirmed && (
                                  <button
                                    type="button"
                                    className="text-xs font-medium fx-underline-anim"
                                    onClick={(e) => handleEditClick(e, addr)}
                                  >
                                    Editar
                                  </button>
                                )}
                              </div>
                              <span className="flex mt-0.5">{addr.phone}</span>
                              <p>
                                {addr.street}, {addr.details}, {addr.postalCode}
                              </p>
                              <p>
                                {addr.city}, {addr.province}, {addr.country}
                              </p>

                              {!isAddressConfirmed && addr.isDefault && (
                                <p className="p-1 text-xs flex w-fit mt-2 -ml-1 font-medium rounded-full bg-neutral-100">
                                  Dirección predeterminada
                                </p>
                              )}
                            </div>
                          </div>
                        );
                      })}

                      {!isAddressConfirmed && (
                        <div className="flex gap-4 pt-2">
                          <Button
                            type="button"
                            onClick={handleAddNewClick}
                            variant={"outline"}
                            className="flex-1 py-3"
                          >
                            <FaPlus className="size-3" /> Nueva dirección
                          </Button>
                          {selectedAddressId && (
                            <Button
                              type="button"
                              onClick={onConfirmAddress}
                              variant={"default"}
                              className="flex-1 py-3"
                            >
                              <FaCheck className="mr-2 size-3" /> Usar esta
                              dirección
                            </Button>
                          )}
                        </div>
                      )}
                    </div>
                  </div>
                ) : (
                  <ShippingAddressForm
                    initialData={addressToEdit}
                    onCancel={() => setIsFormOpen(false)}
                    onSuccess={handleFormSuccess}
                  />
                )}
              </div>
            )}
          </div>
        )}
      </CardContent>
    </Card>
  );
}
