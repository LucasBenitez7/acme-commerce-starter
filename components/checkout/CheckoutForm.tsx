"use client";

import { zodResolver } from "@hookform/resolvers/zod";
import { useRouter } from "next/navigation";
import { useState, useTransition, useEffect } from "react";
import { useForm } from "react-hook-form";
import {
  FaUser,
  FaTruck,
  FaCreditCard,
  FaLock,
  FaHouse,
  FaStore,
} from "react-icons/fa6";
import { toast } from "sonner";

import { Button, Input, Label } from "@/components/ui";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { RadioGroup } from "@/components/ui/radio-group";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Separator } from "@/components/ui/separator";

import { checkoutSchema, type CheckoutFormValues } from "@/lib/checkout/schema";
import { formatCurrency } from "@/lib/currency";
import { STORE_LOCATIONS, PICKUP_LOCATIONS } from "@/lib/locations";

import { createOrderAction } from "@/app/(site)/(shop)/checkout/actions";
import { useCartStore } from "@/store/cart";

type Props = {
  defaultValues?: Partial<CheckoutFormValues>;
  savedAddresses?: any[];
};

export function CheckoutForm({ defaultValues, savedAddresses = [] }: Props) {
  const router = useRouter();
  const { items, clearCart, getTotalPrice } = useCartStore();
  const [isPending, startTransition] = useTransition();
  const [selectedAddressId, setSelectedAddressId] = useState<string>(
    savedAddresses.length > 0
      ? savedAddresses.find((a) => a.isDefault)?.id || savedAddresses[0].id
      : "new",
  );

  const form = useForm({
    resolver: zodResolver(checkoutSchema),
    defaultValues: {
      country: "ES",
      shippingType: "home", // Default
      paymentMethod: "card",
      ...defaultValues,
    },
  });

  // Observamos el tipo de envío para mostrar campos condicionales
  const shippingType = form.watch("shippingType");

  // Efecto: Rellenar dirección guardada
  useEffect(() => {
    if (selectedAddressId !== "new" && shippingType === "home") {
      const addr = savedAddresses.find((a) => a.id === selectedAddressId);
      if (addr) {
        form.setValue("firstName", addr.firstName);
        form.setValue("lastName", addr.lastName);
        form.setValue("phone", addr.phone || "");
        form.setValue("street", addr.street);
        form.setValue("details", addr.details || "");
        form.setValue("postalCode", addr.postalCode);
        form.setValue("city", addr.city);
        form.setValue("province", addr.province);
      }
    }
  }, [selectedAddressId, savedAddresses, form, shippingType]);

  const onSubmit = (data: any) => {
    if (items.length === 0) {
      toast.error("Tu carrito está vacío");
      router.push("/catalogo");
      return;
    }

    startTransition(async () => {
      const formData = new FormData();
      Object.entries(data).forEach(([key, val]) => {
        if (val) formData.append(key, String(val));
      });

      const cartPayload = items.map((item) => ({
        productId: item.productId,
        variantId: item.variantId,
        quantity: item.quantity,
      }));
      formData.append("cartItems", JSON.stringify(cartPayload));

      const res = await createOrderAction({ error: undefined }, formData);

      if (res?.error) {
        toast.error(res.error);
      } else {
        toast.success("¡Pedido realizado con éxito!");
        clearCart();
      }
    });
  };

  return (
    <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-8">
      {/* 1. CONTACTO */}
      <Card>
        <CardHeader>
          <CardTitle className="text-base flex items-center gap-2">
            <FaUser className="text-muted-foreground" /> Contacto
          </CardTitle>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="space-y-2">
            <Label>Email</Label>
            <Input {...form.register("email")} placeholder="tu@email.com" />
            {form.formState.errors.email && (
              <p className="text-xs text-red-500">
                {form.formState.errors.email.message as string}
              </p>
            )}
          </div>
          <div className="grid grid-cols-2 gap-4">
            <div className="space-y-2">
              <Label>Nombre</Label>
              <Input {...form.register("firstName")} />
              {form.formState.errors.firstName && (
                <p className="text-xs text-red-500">
                  {form.formState.errors.firstName.message as string}
                </p>
              )}
            </div>
            <div className="space-y-2">
              <Label>Apellidos</Label>
              <Input {...form.register("lastName")} />
              {form.formState.errors.lastName && (
                <p className="text-xs text-red-500">
                  {form.formState.errors.lastName.message as string}
                </p>
              )}
            </div>
          </div>
          <div className="space-y-2">
            <Label>Teléfono</Label>
            <Input {...form.register("phone")} placeholder="+34..." />
            {form.formState.errors.phone && (
              <p className="text-xs text-red-500">
                {form.formState.errors.phone.message as string}
              </p>
            )}
          </div>
        </CardContent>
      </Card>

      {/* 2. ENVÍO */}
      <Card>
        <CardHeader>
          <CardTitle className="text-base flex items-center gap-2">
            <FaTruck className="text-muted-foreground" /> Método de entrega
          </CardTitle>
        </CardHeader>
        <CardContent className="space-y-6">
          {/* TIPO DE ENVÍO */}
          <RadioGroup
            value={shippingType}
            onValueChange={(val) => form.setValue("shippingType", val as any)}
            className="grid grid-cols-1 sm:grid-cols-3 gap-4"
          >
            <div
              className={`border rounded-md p-4 cursor-pointer hover:bg-neutral-50 ${shippingType === "home" ? "border-black bg-neutral-50" : ""}`}
              onClick={() => form.setValue("shippingType", "home")}
            >
              <div className="flex items-center gap-2 mb-2 font-medium">
                <FaHouse /> A domicilio
              </div>
              <p className="text-xs text-muted-foreground">
                Envío estándar a tu dirección.
              </p>
            </div>
            <div
              className={`border rounded-md p-4 cursor-pointer hover:bg-neutral-50 ${shippingType === "store" ? "border-black bg-neutral-50" : ""}`}
              onClick={() => form.setValue("shippingType", "store")}
            >
              <div className="flex items-center gap-2 mb-2 font-medium">
                <FaStore /> En Tienda
              </div>
              <p className="text-xs text-muted-foreground">
                Gratis. Recogida en nuestras tiendas.
              </p>
            </div>
            <div
              className={`border rounded-md p-4 cursor-pointer hover:bg-neutral-50 ${shippingType === "pickup" ? "border-black bg-neutral-50" : ""}`}
              onClick={() => form.setValue("shippingType", "pickup")}
            >
              <div className="flex items-center gap-2 mb-2 font-medium">
                <FaTruck /> Punto Pack
              </div>
              <p className="text-xs text-muted-foreground">
                Recoge en un punto cercano.
              </p>
            </div>
          </RadioGroup>

          <Separator />

          {/* CAMPOS CONDICIONALES */}

          {/* A) DOMICILIO */}
          {shippingType === "home" && (
            <div className="space-y-4 animate-in fade-in zoom-in-95 duration-200">
              {savedAddresses.length > 0 && (
                <div className="space-y-3 mb-4">
                  <Label>Mis direcciones</Label>
                  <Select
                    value={selectedAddressId}
                    onValueChange={setSelectedAddressId}
                  >
                    <SelectTrigger>
                      <SelectValue placeholder="Selecciona una dirección" />
                    </SelectTrigger>
                    <SelectContent>
                      {savedAddresses.map((addr) => (
                        <SelectItem key={addr.id} value={addr.id}>
                          {addr.firstName} {addr.lastName} - {addr.street}
                        </SelectItem>
                      ))}
                      <SelectItem value="new">Nueva dirección</SelectItem>
                    </SelectContent>
                  </Select>
                </div>
              )}

              <div className="space-y-4">
                <div className="space-y-2">
                  <Label>Calle y número</Label>
                  <Input {...form.register("street")} />
                  {form.formState.errors.street && (
                    <p className="text-xs text-red-500">
                      {form.formState.errors.street.message as string}
                    </p>
                  )}
                </div>
                <div className="grid grid-cols-3 gap-4">
                  <div className="space-y-2">
                    <Label>CP</Label>
                    <Input {...form.register("postalCode")} />
                    {form.formState.errors.postalCode && (
                      <p className="text-xs text-red-500">
                        {form.formState.errors.postalCode.message as string}
                      </p>
                    )}
                  </div>
                  <div className="space-y-2">
                    <Label>Ciudad</Label>
                    <Input {...form.register("city")} />
                    {form.formState.errors.city && (
                      <p className="text-xs text-red-500">
                        {form.formState.errors.city.message as string}
                      </p>
                    )}
                  </div>
                  <div className="space-y-2">
                    <Label>Provincia</Label>
                    <Input {...form.register("province")} />
                  </div>
                </div>
              </div>
            </div>
          )}

          {/* B) TIENDA */}
          {shippingType === "store" && (
            <div className="space-y-4 animate-in fade-in zoom-in-95 duration-200">
              <Label>Selecciona una tienda</Label>
              <Select
                onValueChange={(val) => form.setValue("storeLocationId", val)}
              >
                <SelectTrigger>
                  <SelectValue placeholder="Elige tu tienda más cercana" />
                </SelectTrigger>
                <SelectContent>
                  {STORE_LOCATIONS.map((loc) => (
                    <SelectItem key={loc.id} value={loc.id}>
                      <span className="font-medium">{loc.name}</span>
                      <span className="text-muted-foreground ml-2 text-xs">
                        ({loc.distance})
                      </span>
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
              {form.formState.errors.storeLocationId && (
                <p className="text-xs text-red-500">
                  Debes seleccionar una tienda
                </p>
              )}
            </div>
          )}

          {/* C) PICKUP */}
          {shippingType === "pickup" && (
            <div className="space-y-4 animate-in fade-in zoom-in-95 duration-200">
              <Label>Selecciona un punto de recogida</Label>
              <Select
                onValueChange={(val) => form.setValue("pickupLocationId", val)}
              >
                <SelectTrigger>
                  <SelectValue placeholder="Elige un punto de recogida" />
                </SelectTrigger>
                <SelectContent>
                  {PICKUP_LOCATIONS.map((loc) => (
                    <SelectItem key={loc.id} value={loc.id}>
                      <span className="font-medium">{loc.name}</span>
                      <span className="text-muted-foreground ml-2 text-xs">
                        ({loc.addressLine1})
                      </span>
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
              {form.formState.errors.pickupLocationId && (
                <p className="text-xs text-red-500">
                  Debes seleccionar un punto
                </p>
              )}
            </div>
          )}
        </CardContent>
      </Card>

      {/* 3. PAGO */}
      <Card>
        <CardHeader>
          <CardTitle className="text-base flex items-center gap-2">
            <FaCreditCard className="text-muted-foreground" /> Pago
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="p-4 bg-neutral-50 border rounded-md text-sm text-muted-foreground text-center">
            <p>🔒 Modo Simulación</p>
            <p>El pedido se procesará como "Pagado" automáticamente.</p>
          </div>
        </CardContent>
      </Card>

      <Button
        type="submit"
        className="w-full bg-black text-white py-6 text-lg shadow-lg hover:bg-neutral-800"
        disabled={isPending}
      >
        {isPending
          ? "Procesando..."
          : `Pagar ${formatCurrency(getTotalPrice())}`}
        {!isPending && <FaLock className="ml-2 h-4 w-4 opacity-70" />}
      </Button>
    </form>
  );
}
