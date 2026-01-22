"use client";

import { useState } from "react";
import { toast } from "sonner";

import {
  deleteAddressAction,
  setDefaultAddressAction,
} from "@/app/(site)/(account)/account/addresses/actions";

export function useAddressActions() {
  const [loading, setLoading] = useState(false);

  const setAsDefault = async (addressId: string) => {
    setLoading(true);
    try {
      const res = await setDefaultAddressAction(addressId);
      if (res?.error) {
        toast.error(res.error);
      } else {
        toast.success("Dirección principal actualizada");
      }
    } catch (error) {
      toast.error("Error al actualizar");
    } finally {
      setLoading(false);
    }
  };

  const removeAddress = async (addressId: string) => {
    setLoading(true);
    try {
      const res = await deleteAddressAction(addressId);
      if (res?.error) {
        toast.error(res.error);
      } else {
        toast.success("Dirección eliminada");
      }
    } catch (error) {
      toast.error("Error al eliminar");
    } finally {
      setLoading(false);
    }
  };

  return { loading, setAsDefault, removeAddress };
}
