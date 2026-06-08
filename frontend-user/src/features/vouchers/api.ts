import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query"
import { apiClient } from "@/lib/api-client"
import { queryKeys } from "@/lib/query-keys"
import type {
  AvailableVouchersResponse,
  ShippingMethod,
  ValidateVoucherRequest,
  ValidateVoucherResponse,
  VoucherPromotion,
  WalletVoucher,
} from "@/types"

export async function validateVoucher(
  payload: ValidateVoucherRequest,
): Promise<ValidateVoucherResponse> {
  const { data } = await apiClient.post<ValidateVoucherResponse>("/vouchers/validate", payload)
  return data
}

export async function fetchAvailableVouchers(payload: {
  items: ValidateVoucherRequest["items"]
  shippingMethod: ShippingMethod
  province: string
  district?: string | null
}): Promise<AvailableVouchersResponse> {
  const { data } = await apiClient.post<AvailableVouchersResponse>("/vouchers/available", payload)
  return data
}

export async function fetchVoucherPromotions(): Promise<VoucherPromotion[]> {
  const { data } = await apiClient.get<VoucherPromotion[]>("/vouchers/promotions")
  return data
}

export async function fetchVoucherWallet(): Promise<WalletVoucher[]> {
  const { data } = await apiClient.get<WalletVoucher[]>("/vouchers/wallet")
  return data
}

export async function claimVoucher(id: number | string): Promise<{
  message: string
  code: string
  alreadyClaimed: boolean
}> {
  const { data } = await apiClient.post<{ message: string; code: string; alreadyClaimed: boolean }>(
    `/vouchers/${id}/claim`,
    {},
  )
  return data
}

export function useValidateVoucher() {
  return useMutation({
    mutationFn: validateVoucher,
  })
}

export function useAvailableVouchers(
  payload: {
    items: ValidateVoucherRequest["items"]
    shippingMethod: ShippingMethod
    province: string
    district?: string | null
  } | null,
) {
  return useQuery({
    queryKey: queryKeys.vouchers.available(payload),
    queryFn: () => fetchAvailableVouchers(payload!),
    enabled: Boolean(payload && payload.items.length > 0),
  })
}

export function useVoucherPromotions(enabled = true) {
  return useQuery({
    queryKey: queryKeys.vouchers.promotions,
    queryFn: fetchVoucherPromotions,
    enabled,
  })
}

export function useVoucherWallet(options?: { enabled?: boolean }) {
  return useQuery({
    queryKey: queryKeys.vouchers.wallet,
    queryFn: fetchVoucherWallet,
    enabled: options?.enabled ?? true,
  })
}

export function useClaimVoucher() {
  const qc = useQueryClient()
  return useMutation({
    mutationFn: claimVoucher,
    onSuccess: () => {
      qc.invalidateQueries({ queryKey: queryKeys.vouchers.promotions })
      qc.invalidateQueries({ queryKey: queryKeys.vouchers.wallet })
      qc.invalidateQueries({ queryKey: ["vouchers", "available"] })
    },
  })
}