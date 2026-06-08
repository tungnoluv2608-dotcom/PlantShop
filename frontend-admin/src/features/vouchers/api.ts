import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query"
import { apiClient } from "@/lib/api-client"
import { queryKeys } from "@/lib/query-keys"
import type {
  MessageResponse,
  Voucher,
  VoucherPayload,
  VoucherRedemptionsReport,
} from "@/types"

export function useVouchers() {
  return useQuery({
    queryKey: queryKeys.vouchers.all,
    queryFn: async () => {
      const { data } = await apiClient.get<Voucher[]>("/admin/vouchers")
      return data
    },
  })
}

export function useVoucher(id: string | undefined) {
  return useQuery({
    queryKey: queryKeys.vouchers.detail(id ?? ""),
    enabled: Boolean(id),
    queryFn: async () => {
      const { data } = await apiClient.get<Voucher>(`/admin/vouchers/${id}`)
      return data
    },
  })
}

export function useVoucherRedemptions(id: string | undefined) {
  return useQuery({
    queryKey: queryKeys.vouchers.redemptions(id ?? ""),
    enabled: Boolean(id),
    queryFn: async () => {
      const { data } = await apiClient.get<VoucherRedemptionsReport>(
        `/admin/vouchers/${id}/redemptions`,
      )
      return data
    },
  })
}

export function useCreateVoucher() {
  const qc = useQueryClient()
  return useMutation({
    mutationFn: async (payload: VoucherPayload) => {
      const { data } = await apiClient.post<{ id: number; message: string }>(
        "/admin/vouchers",
        payload,
      )
      return data
    },
    onSuccess: () => qc.invalidateQueries({ queryKey: queryKeys.vouchers.all }),
  })
}

export function useUpdateVoucher() {
  const qc = useQueryClient()
  return useMutation({
    mutationFn: async ({ id, payload }: { id: string; payload: VoucherPayload }) => {
      const { data } = await apiClient.put<MessageResponse>(
        `/admin/vouchers/${id}`,
        payload,
      )
      return data
    },
    onSuccess: (_data, vars) => {
      qc.invalidateQueries({ queryKey: queryKeys.vouchers.all })
      qc.invalidateQueries({ queryKey: queryKeys.vouchers.detail(vars.id) })
      qc.invalidateQueries({ queryKey: queryKeys.vouchers.redemptions(vars.id) })
    },
  })
}

export function useDeleteVoucher() {
  const qc = useQueryClient()
  return useMutation({
    mutationFn: async (id: string) => {
      const { data } = await apiClient.delete<MessageResponse>(`/admin/vouchers/${id}`)
      return data
    },
    onSuccess: () => qc.invalidateQueries({ queryKey: queryKeys.vouchers.all }),
  })
}