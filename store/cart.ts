import { create } from "zustand";
import { persist, createJSONStorage } from "zustand/middleware";

// export type LastRemovedStackEntry = {
//   slug: string;
//   variantId: string;
//   qty: number;
//   removedAt: number;
//   index: number;
// };

export type CartItem = {
  productId: string;
  variantId: string;
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

  addItem: (item: CartItem) => void;
  removeItem: (variantId: string) => void;
  updateQuantity: (variantId: string, quantity: number) => void;
  clearCart: () => void;
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
          (item) => item.variantId === newItem.variantId,
        );

        if (existingItem) {
          const newQuantity = Math.min(
            existingItem.quantity + newItem.quantity,
            newItem.maxStock,
          );

          set({
            items: currentItems.map((item) =>
              item.variantId === newItem.variantId
                ? { ...item, quantity: newQuantity }
                : item,
            ),
            isOpen: true,
          });
        } else {
          set({ items: [...currentItems, newItem], isOpen: true });
        }
      },

      removeItem: (variantId) => {
        set((state) => ({
          items: state.items.filter((i) => i.variantId !== variantId),
        }));
      },

      updateQuantity: (variantId, quantity) => {
        const { items } = get();
        set({
          items: items.map((item) => {
            if (item.variantId === variantId) {
              const validQuantity = Math.max(
                1,
                Math.min(quantity, item.maxStock),
              );
              return { ...item, quantity: validQuantity };
            }
            return item;
          }),
        });
      },

      clearCart: () => set({ items: [] }),

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
