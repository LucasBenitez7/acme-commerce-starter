"use client";

import { type UserAddress } from "@prisma/client";

import { useCheckout } from "@/hooks/checkout/use-checkout";

import { PaymentSection } from "./sections/PaymentSection";
import { ShippingSection } from "./sections/ShippingSection";

type Props = {
  savedAddresses?: UserAddress[];
  userId?: string;
};

export function CheckoutForm({ savedAddresses = [], userId }: Props) {
  const {
    selectedAddressId,
    setSelectedAddressId,
    isAddressConfirmed,
    setIsAddressConfirmed,
    onCheckoutSubmit,
  } = useCheckout(savedAddresses);

  const isGuestUser = !userId;

  return (
    <form
      id="checkout-main-form"
      onSubmit={onCheckoutSubmit}
      className="space-y-6"
    >
      <ShippingSection
        savedAddresses={savedAddresses}
        selectedAddressId={selectedAddressId}
        setSelectedAddressId={setSelectedAddressId}
        isAddressConfirmed={isAddressConfirmed}
        onConfirmAddress={() => setIsAddressConfirmed(true)}
        onChangeAddress={() => setIsAddressConfirmed(false)}
        isGuest={isGuestUser}
      />

      <PaymentSection isOpen={isAddressConfirmed} />
    </form>
  );
}
