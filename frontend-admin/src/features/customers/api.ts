import { useQuery } from "@tanstack/react-query"
import { apiClient } from "@/lib/api-client"
import { queryKeys } from "@/lib/query-keys"
import type { Customer, CustomerDetail } from "@/types"

export function useCustomers() {
  return useQuery({
    queryKey: queryKeys.customers.all,
    queryFn: async () => {
      const { data } = await apiClient.get<Customer[]>("/admin/customers")
      return data
    },
  })
}

export function useCustomer(id?: string) {
  return useQuery({
    queryKey: queryKeys.customers.detail(id ?? ""),
    queryFn: async () => {
      const { data } = await apiClient.get<CustomerDetail>(`/admin/customers/${id}`)
      return data
    },
    enabled: Boolean(id),
  })
}