"use client";

import { zodResolver } from "@hookform/resolvers/zod";
import { type UserAddress } from "@prisma/client";
import { useTransition } from "react";
import { useForm } from "react-hook-form";
import { toast } from "sonner";

import { Button, Input, Label, Checkbox } from "@/components/ui";

import {
  addressFormSchema,
  type AddressFormValues,
} from "@/lib/account/schema";

import { upsertAddressAction } from "@/app/(site)/(account)/account/addresses/actions";

type Props = {
  initialData?: Partial<UserAddress> | null;
  onCancel: () => void;
  onSuccess: (address: UserAddress) => void;
};

export function ShippingAddressForm({
  initialData,
  onCancel,
  onSuccess,
}: Props) {
  const [isPending, startTransition] = useTransition();

  const {
    register,
    handleSubmit,
    setValue,
    formState: { errors },
  } = useForm<AddressFormValues>({
    resolver: zodResolver(addressFormSchema),
    defaultValues: {
      firstName: initialData?.firstName || "",
      lastName: initialData?.lastName || "",
      phone: initialData?.phone || "",
      street: initialData?.street || "",
      details: initialData?.details || "",
      postalCode: initialData?.postalCode || "",
      city: initialData?.city || "",
      province: initialData?.province || "",
      country: initialData?.country || "España",
      isDefault: initialData?.isDefault || false,
    },
  });

  const onSave = (data: AddressFormValues) => {
    startTransition(async () => {
      const res = await upsertAddressAction({ ...data, id: initialData?.id });

      if (res.error) {
        toast.error(res.error);
      } else if (res.address) {
        onSuccess(res.address as UserAddress);
      }
    });
  };

  return (
    <div className="border rounded-xs p-4 bg-neutral-50/50">
      <h4 className="font-semibold text-base mb-4 border-b pb-2">
        {initialData?.id ? "Editar Dirección" : "Nueva Dirección de Envío"}
      </h4>

      <div className="space-y-4">
        <div className="grid grid-cols-2 gap-4">
          <div className="space-y-1">
            <Label className="font-medium text-sm">Nombre</Label>
            <Input {...register("firstName")} placeholder="Ej: Juan" />
            {errors.firstName && (
              <p className="text-red-500 text-xs">{errors.firstName.message}</p>
            )}
          </div>
          <div className="space-y-1">
            <Label className="font-medium text-sm">Apellidos</Label>
            <Input {...register("lastName")} placeholder="Ej: Pérez" />
            {errors.lastName && (
              <p className="text-red-500 text-xs">{errors.lastName.message}</p>
            )}
          </div>
        </div>

        <div className="space-y-1">
          <Label className="font-medium text-sm">Teléfono</Label>
          <Input
            {...register("phone")}
            onInput={(e) =>
              (e.currentTarget.value = e.currentTarget.value.replace(
                /[^0-9+\s]/g,
                "",
              ))
            }
            placeholder="+34 600..."
          />
          {errors.phone && (
            <p className="text-red-500 text-xs">{errors.phone.message}</p>
          )}
        </div>

        {/* DIRECCIÓN */}
        <div className="space-y-1">
          <Label className="font-medium text-sm">Dirección</Label>
          <Input {...register("street")} placeholder="Calle, número..." />
          {errors.street && (
            <p className="text-red-500 text-xs">{errors.street.message}</p>
          )}
        </div>

        <div className="space-y-1">
          <Label className="font-medium text-sm">Detalles (Opcional)</Label>
          <Input {...register("details")} placeholder="Piso, puerta..." />
        </div>

        <div className="grid grid-cols-3 gap-4">
          <div className="space-y-1">
            <Label className="font-medium text-sm">CP</Label>
            <Input
              {...register("postalCode")}
              maxLength={5}
              inputMode="numeric"
              onInput={(e) => {
                e.currentTarget.value = e.currentTarget.value.replace(
                  /[^0-9]/g,
                  "",
                );
              }}
            />
            {errors.postalCode && (
              <p className="text-red-500 text-xs">
                {errors.postalCode.message}
              </p>
            )}
          </div>
          <div className="space-y-1">
            <Label className="font-medium text-sm">Ciudad</Label>
            <Input {...register("city")} />
            {errors.city && (
              <p className="text-red-500 text-xs">{errors.city.message}</p>
            )}
          </div>
          <div className="space-y-1">
            <Label className="font-medium text-sm">Provincia</Label>
            <Input {...register("province")} />
            {errors.province && (
              <p className="text-red-500 text-xs">{errors.province.message}</p>
            )}
          </div>
        </div>

        <div className="flex items-center space-x-2 pt-2">
          <Checkbox
            id="def"
            onCheckedChange={(c) => setValue("isDefault", c === true)}
            {...register("isDefault")}
          />
          <Label htmlFor="def" className="font-medium cursor-pointer text-sm">
            Guardar como predeterminada
          </Label>
        </div>

        <div className="flex gap-4 pt-2">
          <Button
            type="button"
            variant="outline"
            onClick={onCancel}
            className="px-4"
          >
            Cancelar
          </Button>

          <Button
            type="button"
            onClick={handleSubmit(onSave)}
            disabled={isPending}
            className="px-4"
          >
            {isPending ? "Guardando..." : "Guardar dirección"}
          </Button>
        </div>
      </div>
    </div>
  );
}
