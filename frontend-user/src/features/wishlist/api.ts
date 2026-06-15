import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query"
import { toast } from "sonner"
import { apiClient, getApiErrorMessage } from "@/lib/api-client"
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
      // onMutate runs first and toggles the store to the *target* state.
      // Read that intended state here — not the pre-click state.
      const shouldBeFavorite = useWishlistStore.getState().has(productId)
      if (shouldBeFavorite) {
        await apiClient.post(`/wishlist/${productId}`)
        return { productId, added: true }
      }
      await apiClient.delete(`/wishlist/${productId}`)
      return { productId, added: false }
    },
    onMutate: (productId: string) => {
      const wasFavorite = store.has(productId)
      if (wasFavorite) store.remove(productId)
      else store.add(productId)
      return { wasFavorite }
    },
    onSuccess: (result) => {
      toast.success(
        result.added ? "Đã thêm vào yêu thích" : "Đã xóa khỏi danh sách yêu thích",
      )
    },
    onError: (err, productId, context) => {
      if (context?.wasFavorite) store.add(productId)
      else store.remove(productId)
      toast.error(getApiErrorMessage(err, "Không thể cập nhật danh sách yêu thích."))
    },
    onSettled: () => {
      qc.invalidateQueries({ queryKey: queryKeys.wishlist.all })
    },
  })
}
