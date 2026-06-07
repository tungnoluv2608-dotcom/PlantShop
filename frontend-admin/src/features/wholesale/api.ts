import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query"
import { apiClient } from "@/lib/api-client"
import { queryKeys } from "@/lib/query-keys"
import type { WholesaleInquiry, WholesaleUpdatePayload } from "@/types"

export function useWholesaleInquiries(status?: string, q?: string) {
  return useQuery({
    queryKey: queryKeys.wholesale.all(status, q),
    queryFn: async () => {
      const params: Record<string, string> = {}
      if (status) params.status = status
      if (q) params.q = q
      const { data } = await apiClient.get<WholesaleInquiry[]>(
        "/admin/wholesale-inquiries",
        { params }
      )
      return data
    },
  })
}

export function useWholesaleInquiry(id: string | undefined) {
  return useQuery({
    queryKey: queryKeys.wholesale.detail(id ?? ""),
    enabled: Boolean(id),
    queryFn: async () => {
      const { data } = await apiClient.get<WholesaleInquiry>(
        `/admin/wholesale-inquiries/${id}`
      )
      return data
    },
  })
}

export function useUpdateWholesale() {
  const qc = useQueryClient()
  return useMutation({
    mutationFn: async ({ id, payload }: { id: string; payload: WholesaleUpdatePayload }) => {
      const { data } = await apiClient.patch<WholesaleInquiry>(
        `/admin/wholesale-inquiries/${id}`,
        payload
      )
      return data
    },
    onSuccess: (_data, { id }) => {
      qc.invalidateQueries({ queryKey: ["admin", "wholesale"] })
      qc.invalidateQueries({ queryKey: queryKeys.wholesale.detail(id) })
    },
  })
}
