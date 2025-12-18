"use client";

import { useState } from "react";
import { FaTrash, FaCheck, FaPencil } from "react-icons/fa6";
import { toast } from "sonner";

import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
  AlertDialogTrigger,
} from "@/components/ui/alert-dialog";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader } from "@/components/ui/card";

import { type AddressFormValues } from "@/lib/account/schema";

import {
  deleteAddressAction,
  setDefaultAddressAction,
} from "@/app/(site)/(account)/account/addresses/actions";

import { AddressFormDialog } from "./AddressFormDialog";

import type { UserAddress } from "@prisma/client";

export function AddressCard({ address }: { address: UserAddress }) {
  const [loading, setLoading] = useState(false);

  const handleSetDefault = async () => {
    setLoading(true);
    const res = await setDefaultAddressAction(address.id);
    if (res?.error) toast.error(res.error);
    else toast.success("Dirección principal actualizada");
    setLoading(false);
  };

  const handleDelete = async () => {
    setLoading(true);
    const res = await deleteAddressAction(address.id);
    if (res?.error) toast.error(res.error);
    else toast.success("Dirección eliminada");
    setLoading(false);
  };

  const addressForForm = {
    ...address,
    name: address.name ?? undefined,
    phone: address.phone ?? "",
    details: address.details ?? undefined,
  };

  return (
    <Card
      className={`relative group transition-all ${address.isDefault ? "border-black shadow-md" : "border-neutral-200 hover:border-neutral-400"}`}
    >
      {address.isDefault && (
        <div className="absolute top-0 right-0 bg-black text-white text-[10px] font-bold px-2 py-1 rounded-bl-md rounded-tr-md">
          PREDETERMINADA
        </div>
      )}

      <CardHeader className="pb-2">
        <h3 className="font-semibold text-base">
          {address.firstName} {address.lastName}
        </h3>
        <p className="text-sm text-muted-foreground flex items-center gap-2">
          {address.phone}
        </p>
      </CardHeader>

      <CardContent className="text-sm space-y-1">
        <p>{address.street}</p>
        {address.details && (
          <p className="text-muted-foreground">{address.details}</p>
        )}
        <p>
          {address.postalCode}, {address.city}
        </p>
        <p>
          {address.province}, {address.country}
        </p>

        <div className="pt-4 flex gap-2 flex-wrap">
          {/* Botón Editar (Abre el modal reutilizado) */}
          <AddressFormDialog
            address={addressForForm}
            trigger={
              <Button variant="outline" size="sm" className="h-8">
                <FaPencil className="mr-2 h-3 w-3" /> Editar
              </Button>
            }
          />

          {/* Botón Eliminar */}
          <AlertDialog>
            <AlertDialogTrigger asChild>
              <Button
                variant="ghost"
                size="sm"
                className="h-8 text-red-600 hover:text-red-700 hover:bg-red-50"
              >
                <FaTrash className="h-3 w-3" />
              </Button>
            </AlertDialogTrigger>
            <AlertDialogContent>
              <AlertDialogHeader>
                <AlertDialogTitle>¿Eliminar dirección?</AlertDialogTitle>
                <AlertDialogDescription>
                  Esta acción no se puede deshacer.
                </AlertDialogDescription>
              </AlertDialogHeader>
              <AlertDialogFooter>
                <AlertDialogCancel>Cancelar</AlertDialogCancel>
                <AlertDialogAction
                  onClick={handleDelete}
                  className="bg-red-600"
                >
                  Eliminar
                </AlertDialogAction>
              </AlertDialogFooter>
            </AlertDialogContent>
          </AlertDialog>

          {/* Botón "Hacer Default" (si no lo es ya) */}
          {!address.isDefault && (
            <Button
              variant="ghost"
              size="sm"
              className="h-8 ml-auto text-xs text-muted-foreground hover:text-foreground"
              onClick={handleSetDefault}
              disabled={loading}
            >
              <FaCheck className="mr-1 h-3 w-3" /> Usar por defecto
            </Button>
          )}
        </div>
      </CardContent>
    </Card>
  );
}
