"use client";

import { type UserAddress } from "@prisma/client";
import { useTransition, useEffect } from "react";
import { useFormContext } from "react-hook-form";
import { toast } from "sonner";

import { type CreateOrderInput } from "@/lib/orders/schema";

import { upsertAddressAction } from "@/app/(site)/(account)/account/addresses/actions";

type Props = {
  initialData?: Partial<UserAddress> | null;
  onCancel: () => void;
  onSuccess: (address: UserAddress) => void;
};

export function useShippingAddressForm({
  initialData,
  onCancel,
  onSuccess,
}: Props) {
  const { setValue, trigger, getValues } = useFormContext<CreateOrderInput>();
  const [isPending, startTransition] = useTransition();

  // 1. Cargar datos iniciales al abrir
  useEffect(() => {
    if (initialData) {
      setValue("firstName", initialData.firstName || "");
      setValue("lastName", initialData.lastName || "");
      setValue("phone", initialData.phone || "");
      setValue("street", initialData.street || "");
      setValue("postalCode", initialData.postalCode || "");
      setValue("city", initialData.city || "");
      setValue("province", initialData.province || "");
      setValue("country", initialData.country || "España");
      setValue("addressExtra", initialData.details || "");
      setValue("isDefault", initialData.isDefault || false);
    } else {
      setValue("isDefault", false);
    }
  }, [initialData, setValue]);

  // 2. Guardar OBLIGATORIAMENTE en la Base de Datos
  const handleSaveAndUse = async () => {
    const isValid = await trigger([
      "firstName",
      "lastName",
      "phone",
      "street",
      "postalCode",
      "city",
      "province",
      "country",
    ]);

    if (!isValid) {
      toast.error("Revisa los campos obligatorios");
      return;
    }

    const values = getValues();

    startTransition(async () => {
      const res = await upsertAddressAction({
        id: initialData?.id,
        firstName: values.firstName,
        lastName: values.lastName,
        phone: values.phone,
        street: values.street!,
        postalCode: values.postalCode!,
        city: values.city!,
        province: values.province!,
        country: values.country!,
        details: values.addressExtra,
        isDefault: !!values.isDefault,
      });

      if (res.error) {
        toast.error(res.error);
      } else if (res.address) {
        toast.success("Dirección guardada correctamente");
        onSuccess(res.address as UserAddress);
      }
    });
  };

  return {
    isPending,
    handleSaveAndUse,
  };
}
