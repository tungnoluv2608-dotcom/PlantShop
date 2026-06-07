import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query"
import { apiClient } from "@/lib/api-client"
import { queryKeys } from "@/lib/query-keys"
import type { Category, CategoryPayload, MessageResponse } from "@/types"

export function useCategories() {
  return useQuery({
    queryKey: queryKeys.categories,
    queryFn: async () => {
      const { data } = await apiClient.get<Category[]>("/admin/categories")
      return data
    },
  })
}

export function useCreateCategory() {
  const qc = useQueryClient()
  return useMutation({
    mutationFn: async (payload: CategoryPayload) => {
      const { data } = await apiClient.post<MessageResponse>(
        "/admin/categories",
        payload
      )
      return data
    },
    onSuccess: () => qc.invalidateQueries({ queryKey: queryKeys.categories }),
  })
}

export function useUpdateCategory() {
  const qc = useQueryClient()
  return useMutation({
    mutationFn: async ({ id, payload }: { id: string; payload: CategoryPayload }) => {
      const { data } = await apiClient.put<MessageResponse>(
        `/admin/categories/${id}`,
        payload
      )
      return data
    },
    onSuccess: () => qc.invalidateQueries({ queryKey: queryKeys.categories }),
  })
}

export function useDeleteCategory() {
  const qc = useQueryClient()
  return useMutation({
    mutationFn: async (id: string) => {
      const { data } = await apiClient.delete<MessageResponse>(
        `/admin/categories/${id}`
      )
      return data
    },
    onSuccess: () => qc.invalidateQueries({ queryKey: queryKeys.categories }),
  })
}
