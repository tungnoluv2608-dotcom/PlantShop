import type { AdminOrderRow } from "@/types"
import { getRecipientPhone } from "./order-display"

export function matchesOrderSearch(order: AdminOrderRow, query: string): boolean {
  const q = query.trim().toLowerCase()
  if (!q) return true

  const phone = getRecipientPhone(order).toLowerCase()
  const fields = [
    order.id,
    order.customerName,
    order.customerEmail,
    order.recipientName ?? "",
    order.recipientPhone ?? "",
    order.customerPhone ?? "",
    phone,
    order.trackingNumber ?? "",
  ]

  return fields.some((field) => String(field).toLowerCase().includes(q))
}