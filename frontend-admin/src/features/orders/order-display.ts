import type { AdminOrderDetail, AdminOrderRow, ShippingMethod } from "@/types"
import { formatVND } from "@/lib/format"

export const SHIPPING_METHOD_LABELS: Record<ShippingMethod, string> = {
  standard: "Tiêu chuẩn (2–4 ngày)",
  express: "Nhanh (1–2 ngày)",
  sameday: "Trong ngày",
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