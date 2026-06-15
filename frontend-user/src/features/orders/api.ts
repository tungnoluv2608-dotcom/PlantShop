import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query"
import { apiClient } from "@/lib/api-client"
import { queryKeys } from "@/lib/query-keys"
import type {
  CreateOrderRequest,
  CreateOrderResponse,
  Order,
  PaymentVerifyResult,
} from "@/types"

async function fetchOrders(): Promise<Order[]> {
  const { data } = await apiClient.get<Order[]>("/orders")
  return data.map((o) => ({ ...o, id: String(o.id) }))
}

async function fetchOrder(id: string): Promise<Order> {
  const { data } = await apiClient.get<Order>(`/orders/${id}`)
  return { ...data, id: String(data.id) }
}

export function useOrders() {
  return useQuery({ queryKey: queryKeys.orders.all, queryFn: fetchOrders })
}

export function useOrder(id: string) {
  return useQuery({
    queryKey: queryKeys.orders.detail(id),
    queryFn: () => fetchOrder(id),
    enabled: Boolean(id),
  })
}

export function useCreateOrder() {
  const qc = useQueryClient()
  return useMutation({
    mutationFn: async (payload: CreateOrderRequest) => {
      const { data } = await apiClient.post<CreateOrderResponse>("/orders", payload)
      return data
    },
    onSuccess: () => qc.invalidateQueries({ queryKey: queryKeys.orders.all }),
  })
}

export function useCancelOrder() {
  const qc = useQueryClient()
  return useMutation({
    mutationFn: async (id: string) => {
      const { data } = await apiClient.patch<{ message: string }>(`/orders/${id}/cancel`)
      return data
    },
    onSuccess: (_data, id) => {
      qc.invalidateQueries({ queryKey: queryKeys.orders.all })
      qc.invalidateQueries({ queryKey: queryKeys.orders.detail(id) })
    },
  })
}

export async function createVnpayUrl(orderId: string): Promise<string> {
  const { data } = await apiClient.post<{ paymentUrl: string }>(`/orders/${orderId}/vnpay-url`, {})
  return data.paymentUrl
}

export async function createPayosUrl(
  orderId: string,
  buyerPhone: string,
): Promise<{ checkoutUrl: string }> {
  const { data } = await apiClient.post<{ checkoutUrl: string }>(`/orders/${orderId}/payos-url`, {
    buyerPhone,
  })
  return data
}

export async function verifyVnpay(query: string): Promise<PaymentVerifyResult> {
  const { data } = await apiClient.get<PaymentVerifyResult>(`/orders/vnpay/verify${query}`)
  return data
}

export async function verifyPayos(params: {
  id?: string
  orderCode?: string
}): Promise<PaymentVerifyResult> {
  const { data } = await apiClient.get<PaymentVerifyResult>("/orders/payos/verify", { params })
  return data
}

export async function retryOrderPayment(
  orderId: string,
  paymentMethod: string,
  buyerPhone?: string,
): Promise<void> {
  const method = paymentMethod.toLowerCase()
  if (method === "payos") {
    const { checkoutUrl } = await createPayosUrl(orderId, buyerPhone ?? "")
    window.location.href = checkoutUrl
    return
  }
  if (method === "vnpay") {
    const url = await createVnpayUrl(orderId)
    window.location.href = url
    return
  }
  throw new Error("Phương thức thanh toán không hỗ trợ thanh toán lại.")
}

export function useRetryOrderPayment() {
  return useMutation({
    mutationFn: ({
      orderId,
      paymentMethod,
      buyerPhone,
    }: {
      orderId: string
      paymentMethod: string
      buyerPhone?: string
    }) => retryOrderPayment(orderId, paymentMethod, buyerPhone),
  })
}
