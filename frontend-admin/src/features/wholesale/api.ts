import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query"
import { apiClient } from "@/lib/api-client"
import { queryKeys } from "@/lib/query-keys"
import type {
  WholesaleActivity,
  WholesaleAdminOption,
  WholesaleCreateOrderPayload,
  WholesaleInquiry,
  WholesaleListResponse,
  WholesaleUpdatePayload,
} from "@/types"

export interface WholesaleListParams {
  status?: string
  q?: string
  assigned?: string
  source?: string
  dateFrom?: string
  dateTo?: string
  page?: number
  pageSize?: number
}

export function useWholesaleInquiries(params: WholesaleListParams = {}) {
  return useQuery({
    queryKey: queryKeys.wholesale.all(params),
    queryFn: async () => {
      const queryParams: Record<string, string | number> = {}
      if (params.status && params.status !== "all") queryParams.status = params.status
      if (params.q) queryParams.q = params.q
      if (params.assigned && params.assigned !== "all") queryParams.assigned = params.assigned
      if (params.source && params.source !== "all") queryParams.source = params.source
      if (params.dateFrom) queryParams.dateFrom = params.dateFrom
      if (params.dateTo) queryParams.dateTo = params.dateTo
      queryParams.page = params.page ?? 1
      queryParams.pageSize = params.pageSize ?? 20

      const { data } = await apiClient.get<WholesaleListResponse>(
        "/admin/wholesale-inquiries",
        { params: queryParams }
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

export function useWholesaleActivities(id: string | undefined) {
  return useQuery({
    queryKey: queryKeys.wholesale.activities(id ?? ""),
    enabled: Boolean(id),
    queryFn: async () => {
      const { data } = await apiClient.get<WholesaleActivity[]>(
        `/admin/wholesale-inquiries/${id}/activities`
      )
      return data
    },
  })
}

export function useWholesaleAdmins() {
  return useQuery({
    queryKey: queryKeys.wholesale.admins,
    queryFn: async () => {
      const { data } = await apiClient.get<WholesaleAdminOption[]>(
        "/admin/wholesale-admins"
      )
      return data
    },
    staleTime: 5 * 60_000,
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
      qc.invalidateQueries({ queryKey: queryKeys.wholesale.activities(id) })
    },
  })
}

export function useCreateWholesaleOrder() {
  const qc = useQueryClient()
  return useMutation({
    mutationFn: async ({
      id,
      payload,
    }: {
      id: string
      payload?: WholesaleCreateOrderPayload
    }) => {
      const { data } = await apiClient.post<{ orderId: string; message: string; total: number }>(
        `/admin/wholesale-inquiries/${id}/create-order`,
        payload ?? {}
      )
      return data
    },
    onSuccess: (_data, { id }) => {
      qc.invalidateQueries({ queryKey: ["admin", "wholesale"] })
      qc.invalidateQueries({ queryKey: queryKeys.wholesale.detail(id) })
      qc.invalidateQueries({ queryKey: queryKeys.wholesale.activities(id) })
      qc.invalidateQueries({ queryKey: queryKeys.orders.all })
    },
  })
}