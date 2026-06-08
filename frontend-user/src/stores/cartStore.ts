import { create } from "zustand"
import { persist } from "zustand/middleware"
import { clampOrderQuantity } from "@/lib/stock"

export interface CartItem {
  /** Encoded cart id (see lib/cart-id.ts). Authoritative for the backend. */
  id: string
  title: string
  price: number
  image: string
  /** Display label for planter add-on, e.g. "Có (Kèm Chậu gốm trắng)". */
  planter: string
  quantity: number
  /** Client-side cap from stock at add-to-cart time; backend re-validates at checkout. */
  maxQuantity?: number
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
          const maxQuantity = item.maxQuantity
          const existing = state.items.find((i) => i.id === item.id)
          if (existing) {
            const mergedMax = Math.min(
              existing.maxQuantity ?? Number.POSITIVE_INFINITY,
              maxQuantity ?? Number.POSITIVE_INFINITY,
            )
            const nextQuantity = clampOrderQuantity(
              existing.quantity + quantity,
              Number.isFinite(mergedMax) ? mergedMax : 99,
            )
            return {
              items: state.items.map((i) =>
                i.id === item.id
                  ? {
                      ...i,
                      quantity: nextQuantity,
                      maxQuantity: Number.isFinite(mergedMax) ? mergedMax : i.maxQuantity,
                    }
                  : i,
              ),
            }
          }
          const initialQuantity = clampOrderQuantity(
            quantity,
            maxQuantity ?? 99,
          )
          return {
            items: [...state.items, { ...item, quantity: initialQuantity }],
          }
        }),
      removeItem: (id) =>
        set((state) => ({ items: state.items.filter((i) => i.id !== id) })),
      setQuantity: (id, quantity) =>
        set((state) => ({
          items: state.items
            .map((i) => {
              if (i.id !== id) return i
              const max = i.maxQuantity ?? 99
              return { ...i, quantity: clampOrderQuantity(quantity, max) }
            })
            .filter((i) => i.quantity > 0),
        })),
      clear: () => set({ items: [] }),
      totalItems: () => get().items.reduce((sum, i) => sum + i.quantity, 0),
      subtotal: () => get().items.reduce((sum, i) => sum + i.price * i.quantity, 0),
    }),
    { name: "plantweb-cart" },
  ),
)
