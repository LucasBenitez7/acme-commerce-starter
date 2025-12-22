import { create } from "zustand";
import { persist, createJSONStorage } from "zustand/middleware";

export type CartItem = {
  productId: string;
  variantId: string;

  slug: string;
  name: string;
  price: number;
  image?: string;
  color: string;
  size: string;

  quantity: number;
  maxStock: number;
};

interface CartState {
  items: CartItem[];
  isOpen: boolean;

  // Acciones
  addItem: (item: CartItem) => void;
  removeItem: (variantId: string) => void;
  updateQuantity: (variantId: string, quantity: number) => void;
  clearCart: () => void;

  openCart: () => void;
  closeCart: () => void;
  toggleCart: () => void;

  getTotalPrice: () => number;
  getTotalItems: () => number;
}

export const useCartStore = create<CartState>()(
  persist(
    (set, get) => ({
      items: [],
      isOpen: false,

      addItem: (newItem) => {
        const currentItems = get().items;
        const existingItem = currentItems.find(
          (i) => i.variantId === newItem.variantId,
        );

        if (existingItem) {
          const newQuantity = Math.min(
            existingItem.quantity + newItem.quantity,
            newItem.maxStock,
          );

          set({
            items: currentItems.map((i) =>
              i.variantId === newItem.variantId
                ? { ...i, quantity: newQuantity }
                : i,
            ),
          });
        } else {
          set({ items: [...currentItems, newItem] });
        }
      },

      removeItem: (variantId) => {
        set((state) => ({
          items: state.items.filter((i) => i.variantId !== variantId),
        }));
      },

      updateQuantity: (variantId, quantity) => {
        set((state) => ({
          items: state.items.map((item) => {
            if (item.variantId === variantId) {
              const safeQty = Math.max(1, Math.min(quantity, item.maxStock));
              return { ...item, quantity: safeQty };
            }
            return item;
          }),
        }));
      },

      clearCart: () => set({ items: [] }),

      openCart: () => set({ isOpen: true }),
      closeCart: () => set({ isOpen: false }),
      toggleCart: () => set((state) => ({ isOpen: !state.isOpen })),

      getTotalPrice: () => {
        return get().items.reduce(
          (total, item) => total + item.price * item.quantity,
          0,
        );
      },

      getTotalItems: () => {
        return get().items.reduce((total, item) => total + item.quantity, 0);
      },
    }),
    {
      name: "cart-storage",
      storage: createJSONStorage(() => localStorage),
      skipHydration: true,
    },
  ),
);
