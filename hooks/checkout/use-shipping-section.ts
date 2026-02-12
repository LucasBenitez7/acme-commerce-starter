"use client";

import { type UserAddress } from "@prisma/client";
import { useEffect, useState } from "react";
import { useFormContext } from "react-hook-form";
import { toast } from "sonner";

import { type CreateOrderInput } from "@/lib/orders/schema";

export function useShippingSection(
  savedAddresses: UserAddress[],
  selectedAddressId: string,
  setSelectedAddressId: (id: string) => void,
  isAddressConfirmed: boolean,
  onConfirmAddress: () => void,
  onChangeAddress: () => void,
) {
  const { setValue, watch, resetField, clearErrors } =
    useFormContext<CreateOrderInput>();

  const shippingType = watch("shippingType");

  const [isFormOpen, setIsFormOpen] = useState(false);
  const [addressToEdit, setAddressToEdit] = useState<UserAddress | null>(null);
  const [guestAddress, setGuestAddress] = useState<UserAddress | null>(null);

  const [isSelectingMethod, setIsSelectingMethod] = useState(!shippingType);

  // --- Handlers ---
  const handleChangeMethod = () => {
    setIsSelectingMethod(true);
    onChangeAddress();
  };

  const handleSelectMethod = (type: "home" | "store" | "pickup") => {
    setValue("shippingType", type);
    setIsSelectingMethod(false);
    clearErrors();
    onChangeAddress();
  };

  const handleSelectAddress = (id: string) => {
    if (!isAddressConfirmed) {
      setSelectedAddressId(id);
    }
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
    toast.success(
      addressToEdit ? "Dirección actualizada" : "Dirección guardada",
    );
    if (updatedAddress.id === "guest-temp-id") {
      setGuestAddress(updatedAddress);
    }
    setSelectedAddressId(updatedAddress.id);
    onConfirmAddress();
  };

  const handleCancelForm = () => {
    setIsFormOpen(false);
    setAddressToEdit(null);
  };

  return {
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
    guestAddress,
  };
}
