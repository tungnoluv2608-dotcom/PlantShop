import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query"
import { apiClient } from "@/lib/api-client"
import { queryKeys } from "@/lib/query-keys"
import type {
  AdminOrderRow,
  AdminOrderDetail,
  OrderStatusPayload,
  MessageResponse,
} from "@/types"

export function useAdminOrders() {
  return useQuery({
    queryKey: queryKeys.orders.all,
    queryFn: async () => {
      const { data } = await apiClient.get<AdminOrderRow[]>("/admin/orders")
      return data
    },
  })
}

export function useAdminOrder(id: string | undefined) {
  return useQuery({
    queryKey: queryKeys.orders.detail(id ?? ""),
    enabled: Boolean(id),
    queryFn: async () => {
      const { data } = await apiClient.get<AdminOrderDetail>(`/admin/orders/${id}`)
      return data
    },
  })
}

export function useUpdateOrderStatus() {
  const qc = useQueryClient()
  return useMutation({
    mutationFn: async ({ id, payload }: { id: string; payload: OrderStatusPayload }) => {
      const { data } = await apiClient.patch<MessageResponse>(
        `/admin/orders/${id}/status`,
        payload
      )
      return data
    },
    onSuccess: (_data, { id }) => {
      qc.invalidateQueries({ queryKey: queryKeys.orders.all })
      qc.invalidateQueries({ queryKey: queryKeys.orders.detail(id) })
    },
  })
}
