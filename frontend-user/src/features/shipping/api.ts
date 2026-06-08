import { useQuery } from "@tanstack/react-query"
import { apiClient } from "@/lib/api-client"
import { queryKeys } from "@/lib/query-keys"
import type { ShippingMethod, ShippingQuoteResponse } from "@/types"

export interface ShippingQuoteRequest {
  items: Array<{ id: string; quantity: number }>
  shippingMethod: ShippingMethod
  province: string
  district?: string | null
  ward?: string | null
}

export async function fetchShippingQuote(
  payload: ShippingQuoteRequest,
): Promise<ShippingQuoteResponse> {
  const { data } = await apiClient.post<ShippingQuoteResponse>("/shipping/quote", payload)
  return data
}

export function useShippingQuote(payload: ShippingQuoteRequest | null) {
  return useQuery({
    queryKey: queryKeys.shipping.quote(payload),
    queryFn: () => fetchShippingQuote(payload!),
    enabled: Boolean(payload?.province && payload.items.length > 0),
  })
}