import { create } from "zustand"
import { persist } from "zustand/middleware"

interface WishlistState {
  /** Product ids known to be favorited — for instant heart-toggle UI. */
  ids: string[]
  has: (productId: string) => boolean
  add: (productId: string) => void
  remove: (productId: string) => void
  setAll: (ids: string[]) => void
  clear: () => void
}

/**
 * Wishlist id-set — client mirror for instant toggle feedback. The product
 * data itself comes from the wishlist query (TanStack Query). Products only.
 */
export const useWishlistStore = create<WishlistState>()(
  persist(
    (set, get) => ({
      ids: [],
      has: (productId) => get().ids.includes(productId),
      add: (productId) =>
        set((state) =>
          state.ids.includes(productId) ? state : { ids: [...state.ids, productId] },
        ),
      remove: (productId) =>
        set((state) => ({ ids: state.ids.filter((id) => id !== productId) })),
      setAll: (ids) => set({ ids }),
      clear: () => set({ ids: [] }),
    }),
    { name: "plantweb-wishlist" },
  ),
)
