"use client";

import Image from "next/image";
import { CldUploadWidget } from "next-cloudinary";
import { useFieldArray, useFormContext } from "react-hook-form";
import { FaTrash, FaImage, FaCloudArrowUp } from "react-icons/fa6";

import { Button } from "@/components/ui/button";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";

import type { ProductFormValues } from "@/lib/products/schema";

export function ImagesSection() {
  const { control, watch, setValue } = useFormContext<ProductFormValues>();
  const { fields, append, remove } = useFieldArray({ control, name: "images" });

  const variants = watch("variants") || [];
  // Obtenemos colores únicos para el select
  const availableColors = Array.from(
    new Set(variants.map((v) => v.color).filter(Boolean)),
  );

  return (
    <div className="bg-white p-6 rounded-lg border shadow-sm space-y-4">
      <div className="flex justify-between items-center border-b pb-4">
        <div>
          <h3 className="text-lg font-medium">Galería de Imágenes</h3>
          <p className="text-sm text-muted-foreground">
            Sube imágenes y asignalas a un color específico si es necesario.
          </p>
        </div>

        <CldUploadWidget
          uploadPreset={process.env.NEXT_PUBLIC_CLOUDINARY_UPLOAD_PRESET}
          signatureEndpoint="/api/sign-cloudinary-params"
          onSuccess={(result: any) => {
            if (result.info?.secure_url) {
              append({
                url: result.info.secure_url,
                alt: result.info.original_filename,
                sort: fields.length,
                color: null,
              });
            }
          }}
          options={{
            maxFiles: 5,
            sources: ["local", "url", "camera"],
            styles: {
              palette: {
                window: "#FFFFFF",
                sourceBg: "#F4F4F5",
                windowBorder: "#90A0B3",
                tabIcon: "#000000",
                inactiveTabIcon: "#555a5f",
                menuIcons: "#555a5f",
                link: "#000000",
                action: "#000000",
                inProgress: "#0078FF",
                complete: "#20B832",
                error: "#EA2727",
                textDark: "#000000",
                textLight: "#FFFFFF",
              },
            },
          }}
        >
          {({ open }) => {
            return (
              <Button
                type="button"
                onClick={() => open()}
                variant="secondary"
                className="bg-neutral-900 text-white hover:bg-neutral-800"
              >
                <FaCloudArrowUp className="mr-2" /> Subir Imágenes
              </Button>
            );
          }}
        </CldUploadWidget>
      </div>

      {/* GRID DE IMÁGENES */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        {fields.map((field, index) => {
          const currentColor = watch(`images.${index}.color`);
          const currentUrl = watch(`images.${index}.url`);

          return (
            <div
              key={field.id}
              className="flex gap-4 items-start p-3 border rounded-md bg-neutral-50/50 hover:bg-neutral-50 transition-colors"
            >
              {/* Preview */}
              <div className="h-20 w-20 bg-white border rounded-md shrink-0 overflow-hidden relative group">
                {currentUrl ? (
                  <Image
                    src={currentUrl}
                    alt="Preview"
                    fill
                    className="object-cover"
                    sizes="80px"
                  />
                ) : (
                  <div className="flex items-center justify-center h-full w-full">
                    <FaImage className="text-neutral-300" />
                  </div>
                )}
              </div>

              {/* Controles */}
              <div className="flex-1 space-y-3">
                <div className="flex flex-col gap-1">
                  <span className="text-xs font-medium text-neutral-500 uppercase tracking-wider">
                    Asignar a variante
                  </span>
                  <Select
                    value={currentColor || "all"}
                    onValueChange={(val) =>
                      setValue(
                        `images.${index}.color`,
                        val === "all" ? null : val,
                      )
                    }
                  >
                    <SelectTrigger className="h-8 text-xs bg-white">
                      <SelectValue placeholder="Color..." />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="all">🌐 Todos los colores</SelectItem>
                      {availableColors.map((c) => (
                        <SelectItem key={c} value={c}>
                          🎨 {c}
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                </div>
              </div>

              {/* Botón Eliminar */}
              <Button
                type="button"
                variant="ghost"
                size="icon"
                onClick={() => remove(index)}
                className="text-neutral-400 hover:text-red-600 hover:bg-red-50 -mt-1 -mr-1"
              >
                <FaTrash className="h-4 w-4" />
              </Button>
            </div>
          );
        })}

        {fields.length === 0 && (
          <div className="col-span-full py-12 text-center border-2 border-dashed rounded-lg bg-neutral-50 text-neutral-400">
            <FaImage className="mx-auto h-8 w-8 mb-2 opacity-50" />
            <p>No hay imágenes. Sube algunas para empezar.</p>
          </div>
        )}
      </div>
    </div>
  );
}
