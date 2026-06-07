import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query"
import { apiClient } from "@/lib/api-client"
import { queryKeys } from "@/lib/query-keys"
import type { Planter, PlanterPayload, PlanterType, MessageResponse } from "@/types"

export function usePlanters(type?: PlanterType) {
  return useQuery({
    queryKey: queryKeys.planters.all(type),
    queryFn: async () => {
      const { data } = await apiClient.get<Planter[]>("/admin/planters", {
        params: type ? { type } : undefined,
      })
      return data
    },
  })
}

export function useCreatePlanter() {
  const qc = useQueryClient()
  return useMutation({
    mutationFn: async (payload: PlanterPayload) => {
      const { data } = await apiClient.post<MessageResponse>(
        "/admin/planters",
        payload
      )
      return data
    },
    onSuccess: () =>
      qc.invalidateQueries({ queryKey: ["admin", "planters"] }),
  })
}

export function useUpdatePlanter() {
  const qc = useQueryClient()
  return useMutation({
    mutationFn: async ({ id, payload }: { id: string; payload: PlanterPayload }) => {
      const { data } = await apiClient.put<MessageResponse>(
        `/admin/planters/${id}`,
        payload
      )
      return data
    },
    onSuccess: () =>
      qc.invalidateQueries({ queryKey: ["admin", "planters"] }),
  })
}

export function useDeletePlanter() {
  const qc = useQueryClient()
  return useMutation({
    mutationFn: async (id: string) => {
      const { data } = await apiClient.delete<MessageResponse>(
        `/admin/planters/${id}`
      )
      return data
    },
    onSuccess: () =>
      qc.invalidateQueries({ queryKey: ["admin", "planters"] }),
  })
}
