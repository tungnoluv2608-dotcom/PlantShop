import { create } from "zustand"
import { persist } from "zustand/middleware"

export interface CartItem {
  /** Encoded cart id (see lib/cart-id.ts). Authoritative for the backend. */
  id: string
  title: string
  price: number
  image: string
  /** Display label for planter add-on, e.g. "Có (Kèm Chậu gốm trắng)". */
  planter: string
  quantity: number
}

interface CartState {
  items: CartItem[]
  addItem: (item: Omit<CartItem, "quantity">, quantity?: number) => void
  removeItem: (id: string) => void
  setQuantity: (id: string, quantity: number) => void
  clear: () => void
  totalItems: () => number
  subtotal: () => number
}

/**
 * Shopping cart — client-only state, persisted under `plantweb-cart`.
 * Local totals are ESTIMATES; the backend is the pricing authority at checkout.
 */
export const useCartStore = create<CartState>()(
  persist(
    (set, get) => ({
      items: [],
      addItem: (item, quantity = 1) =>
        set((state) => {
          const existing = state.items.find((i) => i.id === item.id)
          if (existing) {
            return {
              items: state.items.map((i) =>
                i.id === item.id ? { ...i, quantity: i.quantity + quantity } : i,
              ),
            }
          }
          return { items: [...state.items, { ...item, quantity }] }
        }),
      removeItem: (id) =>
        set((state) => ({ items: state.items.filter((i) => i.id !== id) })),
      setQuantity: (id, quantity) =>
        set((state) => ({
          items: state.items
            .map((i) => (i.id === id ? { ...i, quantity: Math.max(1, quantity) } : i))
            .filter((i) => i.quantity > 0),
        })),
      clear: () => set({ items: [] }),
      totalItems: () => get().items.reduce((sum, i) => sum + i.quantity, 0),
      subtotal: () => get().items.reduce((sum, i) => sum + i.price * i.quantity, 0),
    }),
    { name: "plantweb-cart" },
  ),
)
