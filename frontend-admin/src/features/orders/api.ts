import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query"
import { apiClient } from "@/lib/api-client"
import { queryKeys } from "@/lib/query-keys"
import type {
  AdminOrderRow,
  AdminOrderDetail,
  OrderStatusPayload,
  OrderNotePayload,
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

export function useUpdateOrderNote() {
  const qc = useQueryClient()
  return useMutation({
    mutationFn: async ({ id, payload }: { id: string; payload: OrderNotePayload }) => {
      const { data } = await apiClient.patch<MessageResponse>(
        `/admin/orders/${id}/note`,
        payload
      )
      return data
    },
    onSuccess: (_data, { id }) => {
      qc.invalidateQueries({ queryKey: queryKeys.orders.detail(id) })
    },
  })
}

export async function fetchAdminOrderDetails(ids: string[]): Promise<AdminOrderDetail[]> {
  const uniqueIds = [...new Set(ids)]
  const results = await Promise.all(
    uniqueIds.map(async (id) => {
      const { data } = await apiClient.get<AdminOrderDetail>(`/admin/orders/${id}`)
      return data
    })
  )
  return results
}

export async function confirmOrders(ids: string[]): Promise<{ confirmed: number; failed: number }> {
  const uniqueIds = [...new Set(ids)]
  let confirmed = 0
  let failed = 0

  await Promise.all(
    uniqueIds.map(async (id) => {
      try {
        await apiClient.patch<MessageResponse>(`/admin/orders/${id}/status`, {
          status: "confirmed",
        })
        confirmed += 1
      } catch {
        failed += 1
      }
    })
  )

  return { confirmed, failed }
}

export function useBulkConfirmOrders() {
  const qc = useQueryClient()
  return useMutation({
    mutationFn: confirmOrders,
    onSuccess: () => {
      qc.invalidateQueries({ queryKey: queryKeys.orders.all })
    },
  })
}

export function useConfirmOrder() {
  const qc = useQueryClient()
  return useMutation({
    mutationFn: async (id: string) => {
      const { data } = await apiClient.patch<MessageResponse>(`/admin/orders/${id}/status`, {
        status: "confirmed",
      })
      return data
    },
    onSuccess: (_data, id) => {
      qc.invalidateQueries({ queryKey: queryKeys.orders.all })
      qc.invalidateQueries({ queryKey: queryKeys.orders.detail(id) })
    },
  })
}
