import type { AdminOrderDetail, AdminOrderRow, ShippingMethod } from "@/types"
import { formatVND } from "@/lib/format"

export const SHIPPING_METHOD_LABELS: Record<ShippingMethod, string> = {
  standard: "Tiêu chuẩn (2–4 ngày)",
  express: "Nhanh (1–2 ngày)",
  sameday: "Trong ngày",
}

/** Payment methods supported by checkout (matches backend VALID_PAYMENT_METHODS). */
export const SUPPORTED_PAYMENT_METHODS = ["cod", "payos", "vnpay"] as const
export type SupportedPaymentMethod = (typeof SUPPORTED_PAYMENT_METHODS)[number]

export const PAYMENT_METHOD_LABELS: Record<SupportedPaymentMethod, string> = {
  cod: "COD",
  payos: "PayOS",
  vnpay: "VNPay",
}

export const PAYMENT_METHOD_FILTER_OPTIONS = [
  { value: "all", label: "Tất cả thanh toán" },
  ...SUPPORTED_PAYMENT_METHODS.map((value) => ({
    value,
    label: PAYMENT_METHOD_LABELS[value],
  })),
]

export function getPaymentMethodLabel(method: string): string {
  const normalized = method.toLowerCase() as SupportedPaymentMethod
  return PAYMENT_METHOD_LABELS[normalized] ?? method.toUpperCase()
}

export interface ResolvedRecipient {
  name: string
  phone: string
  address: string
}

type OrderRecipientSource = Pick<
  AdminOrderDetail,
  | "recipientName"
  | "recipientPhone"
  | "addressLine"
  | "ward"
  | "district"
  | "province"
  | "shippingAddress"
  | "customerName"
  | "customerPhone"
>

export function resolveRecipient(order: OrderRecipientSource): ResolvedRecipient {
  const structured = [order.addressLine, order.ward, order.district, order.province]
    .filter(Boolean)
    .join(", ")

  return {
    name: order.recipientName?.trim() || order.customerName?.trim() || "—",
    phone: order.recipientPhone?.trim() || order.customerPhone?.trim() || "—",
    address: structured || order.shippingAddress?.trim() || "—",
  }
}

export function getCodAmount(paymentMethod: string, total: number): number {
  return paymentMethod.toLowerCase() === "cod" ? total : 0
}

export function formatCodLine(paymentMethod: string, total: number): string {
  const cod = getCodAmount(paymentMethod, total)
  return cod > 0 ? formatVND(cod) : "Đã thanh toán"
}

export function getShippingMethodLabel(method?: ShippingMethod | null): string {
  if (!method) return "—"
  return SHIPPING_METHOD_LABELS[method] ?? method
}

export function getRecipientPhone(row: AdminOrderRow): string {
  return row.recipientPhone?.trim() || row.customerPhone?.trim() || "—"
}