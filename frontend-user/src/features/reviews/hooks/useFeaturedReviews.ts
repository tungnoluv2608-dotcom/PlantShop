import { useQueries } from "@tanstack/react-query"
import { apiClient } from "@/lib/api-client"
import { queryKeys } from "@/lib/query-keys"
import { useProducts } from "@/features/catalog/api"
import type { Review } from "@/types"

async function fetchReviews(productId: string): Promise<Review[]> {
  const { data } = await apiClient.get<Review[]>("/reviews", { params: { productId } })
  return data.map((r) => ({ ...r, id: String(r.id), productId: String(r.productId) }))
}

export function useFeaturedReviews(limit = 4) {
  const { data: productsData, isLoading: productsLoading } = useProducts({
    sort: "best-selling",
    pageSize: 3,
    page: 1,
  })

  const productIds = productsData?.products.map((p) => p.id) ?? []

  const reviewQueries = useQueries({
    queries: productIds.map((productId) => ({
      queryKey: queryKeys.reviews.byProduct(productId),
      queryFn: () => fetchReviews(productId),
      staleTime: 5 * 60_000,
    })),
  })

  const reviewsLoading = reviewQueries.some((q) => q.isLoading)
  const allReviews = reviewQueries.flatMap((q) => q.data ?? [])

  const featured = [...allReviews]
    .filter((r) => r.rating >= 4)
    .sort((a, b) => {
      if (a.verified !== b.verified) return a.verified ? -1 : 1
      return b.rating - a.rating
    })
    .slice(0, limit)

  return {
    reviews: featured,
    isLoading: productsLoading || reviewsLoading,
  }
}