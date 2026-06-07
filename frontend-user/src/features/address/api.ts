import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query"
import { apiClient } from "@/lib/api-client"
import { queryKeys } from "@/lib/query-keys"
import type { ShippingAddress } from "@/types"

export interface AddressPayload {
  label: string
  fullName: string
  phone: string
  province: string
  district: string
  ward?: string
  address: string
  isDefault: boolean
}

async function fetchAddresses(): Promise<ShippingAddress[]> {
  const { data } = await apiClient.get<ShippingAddress[]>("/addresses")
  return data.map((a) => ({ ...a, id: String(a.id) }))
}

export function useAddresses() {
  return useQuery({ queryKey: queryKeys.addresses.all, queryFn: fetchAddresses })
}

export function useCreateAddress() {
  const qc = useQueryClient()
  return useMutation({
    mutationFn: async (payload: AddressPayload) => {
      const { data } = await apiClient.post<ShippingAddress>("/addresses", payload)
      return data
    },
    onSuccess: () => qc.invalidateQueries({ queryKey: queryKeys.addresses.all }),
  })
}

export function useUpdateAddress() {
  const qc = useQueryClient()
  return useMutation({
    mutationFn: async ({ id, payload }: { id: string; payload: AddressPayload }) => {
      const { data } = await apiClient.put<ShippingAddress>(`/addresses/${id}`, payload)
      return data
    },
    onSuccess: () => qc.invalidateQueries({ queryKey: queryKeys.addresses.all }),
  })
}

export function useDeleteAddress() {
  const qc = useQueryClient()
  return useMutation({
    mutationFn: async (id: string) => {
      await apiClient.delete(`/addresses/${id}`)
    },
    onSuccess: () => qc.invalidateQueries({ queryKey: queryKeys.addresses.all }),
  })
}

export function useSetDefaultAddress() {
  const qc = useQueryClient()
  return useMutation({
    mutationFn: async (id: string) => {
      await apiClient.patch(`/addresses/${id}/default`)
    },
    onSuccess: () => qc.invalidateQueries({ queryKey: queryKeys.addresses.all }),
  })
}
