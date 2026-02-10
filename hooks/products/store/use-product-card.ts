import { useState, useMemo, useRef, useEffect } from "react";
import { toast } from "sonner";

import { type PublicProductListItem } from "@/lib/products/types";
import {
  getUniqueColors,
  getUniqueSizes,
  getImageForColor,
  findVariant,
  sortVariantsHelper,
} from "@/lib/products/utils";

import { useCartStore } from "@/store/cart";
import { useProductPreferences } from "@/store/ui";
import { useStore } from "@/store/use-store";

export function useProductCard(item: PublicProductListItem) {
  const imageContainerRef = useRef<HTMLDivElement>(null);
  const [showSizes, setShowSizes] = useState(false);
  const [isMounted, setIsMounted] = useState(false);

  useEffect(() => {
    setIsMounted(true);
  }, []);

  const sortedVariants = useMemo(() => {
    return sortVariantsHelper(item.variants);
  }, [item.variants]);

  // --- STORE ---
  const { selectedColors, setProductColor } = useProductPreferences();
  const savedColor = selectedColors[item.slug];
  const addItem = useCartStore((state) => state.addItem);
  const storeItems = useStore(useCartStore, (state) => state.items);
  const cartItems = isMounted && storeItems ? storeItems : [];

  // --- LÓGICA DE DATOS ---
  const sizes = useMemo(() => getUniqueSizes(sortedVariants), [sortedVariants]);

  const colors = useMemo(() => {
    const stockVariants = sortedVariants.filter((v) => v.stock > 0);
    return getUniqueColors(stockVariants);
  }, [sortedVariants]);

  // --- ESTADOS ---
  const defaultColor = colors.length > 0 ? colors[0] : null;

  const [selectedColor, setSelectedColor] = useState<string | null>(
    defaultColor,
  );

  useEffect(() => {
    if (isMounted && savedColor && colors.includes(savedColor)) {
      setSelectedColor(savedColor);
    }
  }, [isMounted, savedColor, colors]);

  const [selectedSize, setSelectedSize] = useState<string | null>(null);

  // --- HANDLERS ---
  const handleColorSelect = (color: string) => {
    setSelectedColor(color);
    setProductColor(item.slug, color);
  };

  // --- DERIVADOS ---
  const displayImage = useMemo(() => {
    const allImages = item.images || [{ url: item.thumbnail }];
    return getImageForColor(allImages, selectedColor);
  }, [item, selectedColor]);

  const selectedVariant = useMemo(() => {
    return findVariant(sortedVariants, selectedColor, selectedSize);
  }, [sortedVariants, selectedColor, selectedSize]);

  const productUrl = `/product/${item.slug}${
    selectedColor ? `?color=${encodeURIComponent(selectedColor)}` : ""
  }`;

  const cartQty = useMemo(() => {
    if (!selectedVariant) return 0;
    return (
      cartItems.find((i) => i.variantId === selectedVariant.id)?.quantity ?? 0
    );
  }, [cartItems, selectedVariant]);

  const isCombinationValid = selectedVariant
    ? selectedVariant.stock > 0
    : false;
  const isMaxedOut =
    selectedVariant &&
    cartQty >= selectedVariant.stock &&
    selectedVariant.stock > 0;
  const isOutOfStock = item.totalStock === 0;

  // --- ACCIONES ---
  const handleQuickAdd = (size: string) => {
    const variantToAdd = sortedVariants.find(
      (v) =>
        v.size === size &&
        (selectedColor ? v.color === selectedColor : true) &&
        v.stock > 0,
    );

    if (!variantToAdd) return;

    addItem({
      productId: item.id,
      variantId: variantToAdd.id,
      slug: item.slug,
      name: item.name,
      price: variantToAdd.priceCents ?? item.priceCents,
      image: displayImage,
      color: variantToAdd.color,
      size: variantToAdd.size,
      quantity: 1,
      maxStock: variantToAdd.stock,
    });

    toast.success("Añadido al carrito", {
      description: `${item.name} - ${variantToAdd.size}`,
      duration: 2000,
    });
  };

  return {
    imageContainerRef,
    showSizes,
    setShowSizes,
    sizes,
    colors,
    selectedColor,
    selectedSize,
    setSelectedSize,
    handleColorSelect,
    displayImage,
    selectedVariant,
    productUrl,
    isOutOfStock,
    isCombinationValid,
    isMaxedOut,
    cartItems,
    isMounted,
    handleQuickAdd,
  };
}
