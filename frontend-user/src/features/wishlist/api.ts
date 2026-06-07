import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query"
import { apiClient } from "@/lib/api-client"
import { queryKeys } from "@/lib/query-keys"
import type { Product } from "@/types"
import { useAuthStore } from "@/stores/authStore"
import { useWishlistStore } from "@/stores/wishlistStore"

async function fetchWishlist(): Promise<Product[]> {
  const { data } = await apiClient.get<Product[]>("/wishlist")
  return data.map((p) => ({ ...p, id: String(p.id) }))
}

export function useWishlist() {
  const isAuthenticated = useAuthStore((s) => Boolean(s.token))
  const setAll = useWishlistStore((s) => s.setAll)
  return useQuery({
    queryKey: queryKeys.wishlist.all,
    queryFn: async () => {
      const products = await fetchWishlist()
      setAll(products.map((p) => p.id))
      return products
    },
    enabled: isAuthenticated,
  })
}

/** Add/remove a product from the wishlist with optimistic id-set update. */
export function useToggleWishlist() {
  const qc = useQueryClient()
  const store = useWishlistStore()

  return useMutation({
    mutationFn: async (productId: string) => {
      const isFavorite = useWishlistStore.getState().has(productId)
      if (isFavorite) {
        await apiClient.delete(`/wishlist/${productId}`)
        return { productId, added: false }
      }
      await apiClient.post(`/wishlist/${productId}`)
      return { productId, added: true }
    },
    onMutate: (productId: string) => {
      const wasFavorite = store.has(productId)
      if (wasFavorite) store.remove(productId)
      else store.add(productId)
      return { wasFavorite }
    },
    onError: (_err, productId, context) => {
      // rollback
      if (context?.wasFavorite) store.add(productId)
      else store.remove(productId)
    },
    onSettled: () => {
      qc.invalidateQueries({ queryKey: queryKeys.wishlist.all })
    },
  })
}
