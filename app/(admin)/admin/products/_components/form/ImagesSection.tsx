"use client";

import { FaPlus, FaTrash, FaImage } from "react-icons/fa6";

import { Button, Input } from "@/components/ui";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";

import type { FormImage } from "./types";

type Props = {
  images: FormImage[];
  setImages: (imgs: FormImage[]) => void;
  availableColors: string[];
};

export function ImagesSection({ images, setImages, availableColors }: Props) {
  const addImage = () => setImages([...images, { url: "", color: null }]);
  const removeImage = (idx: number) =>
    setImages(images.filter((_, i) => i !== idx));

  const updateImage = (idx: number, field: keyof FormImage, value: any) => {
    const next = [...images];
    next[idx] = { ...next[idx], [field]: value };
    setImages(next);
  };

  return (
    <div className="bg-white p-6 rounded-xs border shadow-sm">
      <div className="flex justify-between items-center mb-4">
        <h3 className="text-lg font-medium">Imágenes</h3>
        <Button type="button" variant="outline" size="sm" onClick={addImage}>
          <FaPlus className="mr-2" /> URL
        </Button>
      </div>

      <div className="space-y-3">
        {images.map((img, idx) => (
          <div
            key={idx}
            className="flex gap-3 items-center p-3 border rounded-xs bg-neutral-50/30"
          >
            <div className="h-10 w-10 bg-white border rounded shrink-0 overflow-hidden flex items-center justify-center">
              {img.url ? (
                // eslint-disable-next-line @next/next/no-img-element
                <img
                  src={img.url}
                  alt=""
                  className="h-full w-full object-cover"
                />
              ) : (
                <FaImage className="text-gray-300" />
              )}
            </div>

            <div className="flex-1 grid grid-cols-1 sm:grid-cols-2 gap-3">
              <Input
                value={img.url}
                onChange={(e) => updateImage(idx, "url", e.target.value)}
                placeholder="https://..."
                className="h-9 text-xs"
                required
              />

              <Select
                value={img.color || "all"}
                onValueChange={(val) =>
                  updateImage(idx, "color", val === "all" ? null : val)
                }
              >
                <SelectTrigger className="h-9 text-xs">
                  <SelectValue placeholder="Asignar a color" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="all">Todas las variantes</SelectItem>
                  {availableColors.map((c) => (
                    <SelectItem key={c} value={c}>
                      {c}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>

            <Button
              type="button"
              variant="ghost"
              size="icon"
              onClick={() => removeImage(idx)}
            >
              <FaTrash className="text-red-500 h-4 w-4" />
            </Button>
          </div>
        ))}
      </div>
      <input type="hidden" name="imagesJson" value={JSON.stringify(images)} />
    </div>
  );
}
