"use client";

import { type UserAddress } from "@prisma/client";
import {
  FaTruck,
  FaPlus,
  FaCheck,
  FaCircleCheck,
  FaMapLocationDot,
} from "react-icons/fa6";

import { Button, Label } from "@/components/ui";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { RadioGroup } from "@/components/ui/radio-group";

import { SHIPPING_METHODS } from "@/lib/locations";

import { useShippingSection } from "@/hooks/checkout/use-shipping-section";

import { ShippingAddressForm } from "./ShippingAddressForm";

type Props = {
  savedAddresses: UserAddress[];
  selectedAddressId: string;
  setSelectedAddressId: (id: string) => void;
  isAddressConfirmed: boolean;
  onConfirmAddress: () => void;
  onChangeAddress: () => void;
};

export function ShippingSection(props: Props) {
  const {
    shippingType,
    isFormOpen,
    addressToEdit,
    isSelectingMethod,
    handleSelectMethod,
    handleChangeMethod,
    handleSelectAddress,
    handleEditClick,
    handleAddNewClick,
    handleFormSuccess,
    handleCancelForm,
  } = useShippingSection(
    props.savedAddresses,
    props.selectedAddressId,
    props.setSelectedAddressId,
    props.isAddressConfirmed,
    props.onConfirmAddress,
    props.onChangeAddress,
  );

  const activeMethod = SHIPPING_METHODS.find((m) => m.id === shippingType);

  return (
    <Card className="p-4">
      <CardHeader className="px-0">
        <div className="flex items-center justify-between">
          <CardTitle className="text-base flex items-center gap-2">
            <FaTruck className="text-muted-foreground" />
            {!isSelectingMethod ? "Método de entrega" : "Seleccione método"}
          </CardTitle>
          {!isSelectingMethod && (
            <Button
              type="button"
              variant="ghost"
              size="sm"
              onClick={handleChangeMethod}
              className="h-auto p-1 px-2 text-xs font-medium rounded-full hover:bg-neutral-100"
            >
              Cambiar
            </Button>
          )}
        </div>
      </CardHeader>

      <CardContent className="space-y-6 px-0">
        {/* 1. SELECCIÓN DE MÉTODO (Grid) */}
        {isSelectingMethod && (
          <RadioGroup
            value={shippingType}
            onValueChange={(val) => handleSelectMethod(val as any)}
            className="grid grid-cols-1 sm:grid-cols-3 gap-4"
          >
            {SHIPPING_METHODS.map((method) => {
              const Icon = method.icon;
              return (
                <div
                  key={method.id}
                  onClick={() => handleSelectMethod(method.id as any)}
                  className={`border rounded-xs p-4 py-6 cursor-pointer text-center transition-all hover:border-foreground ${
                    shippingType === method.id
                      ? "border-foreground bg-neutral-50"
                      : ""
                  }`}
                >
                  <div className="flex items-center justify-center gap-2 mb-1 font-medium text-sm">
                    <Icon /> {method.label}
                  </div>
                </div>
              );
            })}
          </RadioGroup>
        )}

        {/* 2. CONTENIDO DEL MÉTODO SELECCIONADO */}
        {!isSelectingMethod && activeMethod && (
          <div>
            <div className="mb-5 border rounded-xs p-4 py-3 flex items-center justify-start font-medium text-sm gap-5">
              <FaCircleCheck className="text-foreground size-5" />
              <div className="flex items-center gap-2">
                <activeMethod.icon />
                <span>{activeMethod.label}</span>
              </div>
            </div>

            {/* LÓGICA DE DIRECCIONES (SOLO SI ES HOME) */}
            {shippingType === "home" && (
              <div className="space-y-4">
                {!isFormOpen ? (
                  <div className="space-y-3">
                    <div className="flex items-center justify-between">
                      <Label className="text-base font-semibold flex items-center gap-2">
                        <FaMapLocationDot className="text-muted-foreground" />
                        {props.isAddressConfirmed
                          ? "Dirección confirmada"
                          : "Selecciona una dirección"}
                      </Label>
                      {props.isAddressConfirmed && (
                        <Button
                          type="button"
                          variant="ghost"
                          size="sm"
                          onClick={props.onChangeAddress}
                          className="h-auto p-1 px-2 text-xs"
                        >
                          Cambiar
                        </Button>
                      )}
                    </div>

                    <div className="grid grid-cols-1 gap-3">
                      {(props.isAddressConfirmed
                        ? props.savedAddresses.filter(
                            (a) => a.id === props.selectedAddressId,
                          )
                        : props.savedAddresses
                      ).map((addr) => {
                        const isSelected = props.selectedAddressId === addr.id;
                        return (
                          <div
                            key={addr.id}
                            onClick={() => handleSelectAddress(addr.id)}
                            className={`relative flex items-center gap-5 border rounded-xs px-4 py-3 transition-all duration-200 ${
                              props.isAddressConfirmed
                                ? "cursor-default"
                                : isSelected
                                  ? "border-foreground cursor-pointer"
                                  : "border-border hover:border-foreground bg-neutral-50 cursor-pointer"
                            }`}
                          >
                            <div className="shrink-0">
                              {props.isAddressConfirmed ? (
                                <FaCircleCheck className="text-foreground size-5" />
                              ) : (
                                <div
                                  className={`flex h-4 w-4 items-center justify-center rounded-full border border-primary text-primary ${
                                    isSelected ? "" : "opacity-50"
                                  }`}
                                >
                                  {isSelected && (
                                    <div className="h-2.5 w-2.5 rounded-full bg-current" />
                                  )}
                                </div>
                              )}
                            </div>

                            <div className="flex-1 font-normal text-sm">
                              <div className="flex items-center justify-between">
                                <span className="font-semibold">
                                  {addr.firstName} {addr.lastName}
                                </span>
                                {!props.isAddressConfirmed && (
                                  <button
                                    type="button"
                                    className="text-xs font-medium hover:underline"
                                    onClick={(e) => handleEditClick(e, addr)}
                                  >
                                    Editar
                                  </button>
                                )}
                              </div>
                              <span className="block mt-0.5">{addr.phone}</span>
                              <p>
                                {addr.street}, {addr.details || ""},{" "}
                                {addr.postalCode}
                              </p>
                              <p>
                                {addr.city}, {addr.province}, {addr.country}
                              </p>
                            </div>
                          </div>
                        );
                      })}

                      {!props.isAddressConfirmed && (
                        <div className="flex gap-4 pt-2">
                          <Button
                            type="button"
                            onClick={handleAddNewClick}
                            variant="outline"
                            className="flex-1 py-3"
                          >
                            <FaPlus className="mr-2 size-3" /> Nueva dirección
                          </Button>
                          {props.selectedAddressId && (
                            <Button
                              type="button"
                              onClick={props.onConfirmAddress}
                              variant="default"
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
                    onCancel={handleCancelForm}
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
