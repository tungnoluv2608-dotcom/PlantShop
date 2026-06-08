import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query"
import { apiClient } from "@/lib/api-client"
import { queryKeys } from "@/lib/query-keys"
import type { MessageResponse, ShippingZone, ShippingZonePayload } from "@/types"

export function useShippingZones() {
  return useQuery({
    queryKey: queryKeys.shippingZones.all,
    queryFn: async () => {
      const { data } = await apiClient.get<ShippingZone[]>("/admin/shipping-zones")
      return data
    },
  })
}

export function useCreateShippingZone() {
  const qc = useQueryClient()
  return useMutation({
    mutationFn: async (payload: ShippingZonePayload) => {
      const { data } = await apiClient.post<{ id: number; message: string }>(
        "/admin/shipping-zones",
        payload,
      )
      return data
    },
    onSuccess: () => qc.invalidateQueries({ queryKey: queryKeys.shippingZones.all }),
  })
}

export function useUpdateShippingZone() {
  const qc = useQueryClient()
  return useMutation({
    mutationFn: async ({ id, payload }: { id: string; payload: ShippingZonePayload }) => {
      const { data } = await apiClient.put<MessageResponse>(
        `/admin/shipping-zones/${id}`,
        payload,
      )
      return data
    },
    onSuccess: () => qc.invalidateQueries({ queryKey: queryKeys.shippingZones.all }),
  })
}

export function useDeleteShippingZone() {
  const qc = useQueryClient()
  return useMutation({
    mutationFn: async (id: string) => {
      const { data } = await apiClient.delete<MessageResponse>(`/admin/shipping-zones/${id}`)
      return data
    },
    onSuccess: () => qc.invalidateQueries({ queryKey: queryKeys.shippingZones.all }),
  })
}