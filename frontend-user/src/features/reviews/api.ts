import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query"
import { apiClient } from "@/lib/api-client"
import { queryKeys } from "@/lib/query-keys"
import type { Review } from "@/types"

export interface CreateReviewPayload {
  productId: string
  rating: number
  title: string
  content: string
  tags: string[]
  images: string[]
}

async function fetchReviews(productId: string): Promise<Review[]> {
  const { data } = await apiClient.get<Review[]>("/reviews", { params: { productId } })
  return data.map((r) => ({ ...r, id: String(r.id), productId: String(r.productId) }))
}

async function createReview(payload: CreateReviewPayload): Promise<{ id: number; message: string }> {
  const { data } = await apiClient.post("/reviews", payload)
  return data
}

export function useReviews(productId: string) {
  return useQuery({
    queryKey: queryKeys.reviews.byProduct(productId),
    queryFn: () => fetchReviews(productId),
    enabled: Boolean(productId),
  })
}

export function useCreateReview(productId: string) {
  const qc = useQueryClient()
  return useMutation({
    mutationFn: createReview,
    onSuccess: () => {
      qc.invalidateQueries({ queryKey: queryKeys.reviews.byProduct(productId) })
    },
  })
}
