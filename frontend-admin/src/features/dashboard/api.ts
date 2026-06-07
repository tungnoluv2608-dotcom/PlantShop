import { useQuery } from "@tanstack/react-query"
import { apiClient } from "@/lib/api-client"
import { queryKeys } from "@/lib/query-keys"
import type { DashboardStats, AdminOrderRow } from "@/types"

export function useDashboardStats() {
  return useQuery({
    queryKey: queryKeys.stats,
    queryFn: async () => {
      const { data } = await apiClient.get<DashboardStats>("/admin/stats")
      return data
    },
  })
}

/** Recent orders, reused from the admin orders list for the dashboard feed. */
export function useRecentOrders() {
  return useQuery({
    queryKey: queryKeys.orders.all,
    queryFn: async () => {
      const { data } = await apiClient.get<AdminOrderRow[]>("/admin/orders")
      return data
    },
  })
}
