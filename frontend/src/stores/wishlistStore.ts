import { create } from "zustand";
import type { Product } from "../types";
import { wishlistApi } from "../services/apiService";

interface WishlistState {
  items: Product[];
  ids: string[];
  isLoading: boolean;
  hasLoaded: boolean;
  syncWishlist: () => Promise<void>;
  clearWishlist: () => void;
  isFavorite: (productId?: string | number) => boolean;
  addToWishlist: (productId: string | number) => Promise<void>;
  removeFromWishlist: (productId: string | number) => Promise<void>;
  toggleWishlist: (productId: string | number) => Promise<void>;
}

function normalizeId(productId?: string | number) {
  return productId === undefined || productId === null ? "" : String(productId);
}

export const useWishlistStore = create<WishlistState>((set, get) => ({
  items: [],
  ids: [],
  isLoading: false,
  hasLoaded: false,

  syncWishlist: async () => {
    set({ isLoading: true });
    try {
      const items = await wishlistApi.list();
      set({
        items,
        ids: items.map((p) => String(p.id)),
        isLoading: false,
        hasLoaded: true,
      });
    } catch {
      set({ isLoading: false });
      throw new Error("Không thể tải danh sách yêu thích");
    }
  },

  clearWishlist: () => set({ items: [], ids: [], isLoading: false, hasLoaded: false }),

  isFavorite: (productId) => {
    const id = normalizeId(productId);
    if (!id) return false;
    return get().ids.includes(id);
  },

  addToWishlist: async (productId) => {
    const id = normalizeId(productId);
    if (!id) return;
    await wishlistApi.add(id);
    await get().syncWishlist();
  },

  removeFromWishlist: async (productId) => {
    const id = normalizeId(productId);
    if (!id) return;
    await wishlistApi.remove(id);
    set((state) => ({
      items: state.items.filter((p) => String(p.id) !== id),
      ids: state.ids.filter((pid) => pid !== id),
    }));
  },

  toggleWishlist: async (productId) => {
    const id = normalizeId(productId);
    if (!id) return;
    if (get().ids.includes(id)) {
      await get().removeFromWishlist(id);
      return;
    }
    await get().addToWishlist(id);
  },
}));
