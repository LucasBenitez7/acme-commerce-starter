"use client";

import { zodResolver } from "@hookform/resolvers/zod";
import { useTransition } from "react";
import { useForm } from "react-hook-form";
import { FaSave, FaSpinner } from "react-icons/fa";
import { toast } from "sonner";

import { Button } from "@/components/ui/button";
import {
  Form,
  FormControl,
  FormField,
  FormItem,
  FormLabel,
  FormMessage,
} from "@/components/ui/form";
import { Input } from "@/components/ui/input";

import {
  storeConfigSchema,
  type StoreConfigFormValues,
} from "@/lib/settings/schema";

import { updateSettingsAction } from "../_actions/actions";

import { SingleImageUpload } from "./SingleImageUpload";

import type { StoreConfig } from "@prisma/client";

interface Props {
  initialData: StoreConfig | null;
}

export function SettingsForm({ initialData }: Props) {
  const [isPending, startTransition] = useTransition();

  const form = useForm<StoreConfigFormValues>({
    resolver: zodResolver(storeConfigSchema),
    defaultValues: {
      heroImage: initialData?.heroImage || null,
      heroMobileImage: initialData?.heroMobileImage || null,
      heroTitle: initialData?.heroTitle || "",
      heroSubtitle: initialData?.heroSubtitle || "",
      heroLink: initialData?.heroLink || "",
      saleImage: initialData?.saleImage || null,
      saleMobileImage: initialData?.saleMobileImage || null,
      saleTitle: initialData?.saleTitle || "",
    },
  });

  async function onSubmit(data: StoreConfigFormValues) {
    startTransition(async () => {
      const res = await updateSettingsAction(data);
      if (res.error) {
        toast.error(res.error);
      } else {
        toast.success("Configuración guardada correctamente");
      }
    });
  }

  return (
    <div className="max-w-7xl mx-auto">
      <Form {...form}>
        <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-6">
          {/* HERO SECTION */}
          <div className="grid gap-4 md:gap-6 items-start border rounded-xs p-4 md:px-6 bg-background shadow-sm">
            <div className="border-b pb-2">
              <h3 className="text-xl font-semibold">Hero / Portada</h3>
              <p className="text-sm text-muted-foreground">
                Configura las imágenes e información de la sección principal.
              </p>
            </div>

            <div className="grid gap-4">
              <FormField
                control={form.control}
                name="heroTitle"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Título Principal</FormLabel>
                    <FormControl>
                      <Input placeholder="" {...field} />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />

              <FormField
                control={form.control}
                name="heroSubtitle"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Subtítulo</FormLabel>
                    <FormControl>
                      <Input placeholder="" {...field} />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />
            </div>

            <div className="grid gap-6 md:grid-cols-[1fr_1fr] items-start">
              <FormField
                control={form.control}
                name="heroImage"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>
                      Imagen de Portada en pantallas grandes (2:1)
                    </FormLabel>
                    <FormControl>
                      <SingleImageUpload
                        value={field.value}
                        onChange={field.onChange}
                        label="Subir Imagen Desktop"
                        className="aspect-[2/1] w-full"
                      />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />

              <div className="justify-start md:justify-center flex items-start">
                <FormField
                  control={form.control}
                  name="heroMobileImage"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Imagen de Portada en Mobile (4:5)</FormLabel>
                      <FormControl>
                        <SingleImageUpload
                          value={field.value}
                          onChange={field.onChange}
                          label="Subir Imagen Mobile"
                          className="aspect-[4/5] w-full h-[350px]"
                        />
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />
              </div>
            </div>
          </div>

          {/* SALE BANNER */}
          <div className="grid gap-4 md:gap-6 items-start border rounded-xs p-4 md:px-6 bg-background shadow-sm">
            <div className="border-b pb-2">
              <h3 className="text-xl font-semibold">Banner de Rebajas</h3>
              <p className="text-sm text-muted-foreground">
                Personaliza el banner de promociones.
              </p>
            </div>

            <div className="grid gap-4">
              <FormField
                control={form.control}
                name="saleTitle"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Título</FormLabel>
                    <FormControl>
                      <Input placeholder="REBAJAS" {...field} />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />
            </div>

            <div className="grid gap-6 md:grid-cols-[1fr_1fr] items-start">
              <FormField
                control={form.control}
                name="saleImage"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>
                      Imagen de Portada en pantallas grandes (2:1)
                    </FormLabel>
                    <FormControl>
                      <SingleImageUpload
                        value={field.value}
                        onChange={field.onChange}
                        label="Subir Imagen Desktop"
                        className="aspect-[2/1] w-full"
                      />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />

              <div className="justify-start md:justify-center flex items-start">
                <FormField
                  control={form.control}
                  name="saleMobileImage"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Imagen de Portada en Mobile (4:5)</FormLabel>
                      <FormControl>
                        <SingleImageUpload
                          value={field.value}
                          onChange={field.onChange}
                          label="Subir Imagen Mobile"
                          className="aspect-[4/5] w-full h-[350px]"
                        />
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />
              </div>
            </div>
          </div>

          <div className="flex justify-end pt-4 sticky bottom-4 gap-4">
            <Button
              type="button"
              variant="outline"
              disabled={isPending}
              onClick={() => {
                form.reset();
                toast.info("Cambios descartados");
              }}
              className="w-full sm:w-auto px-5 h-11"
              size="lg"
            >
              Cancelar
            </Button>

            <Button
              type="submit"
              disabled={isPending}
              className="w-full sm:w-auto px-5 h-11"
              size="lg"
            >
              {isPending ? <>Guardando...</> : <>Guardar Cambios</>}
            </Button>
          </div>
        </form>
      </Form>
    </div>
  );
}
