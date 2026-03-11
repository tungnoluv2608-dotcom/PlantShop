import { create } from "zustand";
import { persist } from "zustand/middleware";
import type { CartItem } from "../types";

interface CartState {
  items: CartItem[];
  addItem: (item: Omit<CartItem, "quantity"> & { quantity?: number }) => void;
  removeItem: (id: string) => void;
  updateQuantity: (id: string, quantity: number) => void;
  clearCart: () => void;
  totalItems: () => number;
  totalPrice: () => number;
  subtotal: () => number;
  shipping: () => number;
}

export const useCartStore = create<CartState>()(
  persist(
    (set, get) => ({
      items: [],

      addItem: (newItem) => {
        set((state) => {
          const existing = state.items.find((item) => item.id === newItem.id);
          if (existing) {
            return {
              items: state.items.map((item) =>
                item.id === newItem.id
                  ? { ...item, quantity: item.quantity + (newItem.quantity ?? 1) }
                  : item
              ),
            };
          }
          return {
            items: [...state.items, { ...newItem, quantity: newItem.quantity ?? 1 }],
          };
        });
      },

      removeItem: (id) => {
        set((state) => ({
          items: state.items.filter((item) => item.id !== id),
        }));
      },

      updateQuantity: (id, quantity) => {
        if (quantity < 1) return;
        set((state) => ({
          items: state.items.map((item) =>
            item.id === id ? { ...item, quantity } : item
          ),
        }));
      },

      clearCart: () => set({ items: [] }),

      totalItems: () => get().items.reduce((sum, item) => sum + item.quantity, 0),

      totalPrice: () => {
        const subtotal = get().items.reduce((sum, item) => sum + item.price * item.quantity, 0);
        const shipping = get().items.length > 0 ? 30000 : 0;
        return subtotal + shipping;
      },

      subtotal: () => get().items.reduce((sum, item) => sum + item.price * item.quantity, 0),

      shipping: () => (get().items.length > 0 ? 30000 : 0),
    }),
    {
      name: "plantweb-cart",
    }
  )
);
