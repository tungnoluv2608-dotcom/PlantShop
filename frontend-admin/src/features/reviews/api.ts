import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query"
import { apiClient } from "@/lib/api-client"
import { queryKeys } from "@/lib/query-keys"
import type { AdminReview, ReviewModerationPayload, MessageResponse } from "@/types"

export function useAdminReviews() {
  return useQuery({
    queryKey: queryKeys.reviews,
    queryFn: async () => {
      const { data } = await apiClient.get<AdminReview[]>("/admin/reviews")
      return data
    },
  })
}

export function useModerateReview() {
  const qc = useQueryClient()
  return useMutation({
    mutationFn: async ({ id, payload }: { id: string; payload: ReviewModerationPayload }) => {
      const { data } = await apiClient.patch<MessageResponse>(
        `/admin/reviews/${id}`,
        payload
      )
      return data
    },
    onSuccess: () => qc.invalidateQueries({ queryKey: queryKeys.reviews }),
  })
}

export function useDeleteReview() {
  const qc = useQueryClient()
  return useMutation({
    mutationFn: async (id: string) => {
      const { data } = await apiClient.delete<MessageResponse>(`/admin/reviews/${id}`)
      return data
    },
    onSuccess: () => qc.invalidateQueries({ queryKey: queryKeys.reviews }),
  })
}
