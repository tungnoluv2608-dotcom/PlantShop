import { useQuery } from "@tanstack/react-query"
import { apiClient } from "@/lib/api-client"
import { queryKeys } from "@/lib/query-keys"
import type { Customer } from "@/types"

export function useCustomers() {
  return useQuery({
    queryKey: queryKeys.customers,
    queryFn: async () => {
      const { data } = await apiClient.get<Customer[]>("/admin/customers")
      return data
    },
  })
}
