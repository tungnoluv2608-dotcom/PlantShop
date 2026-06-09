import { isWithinDays } from "@/lib/filters"
import type { Customer, CustomerSegment } from "@/types"

export const VIP_SPENT_THRESHOLD = 5_000_000
export const VIP_DELIVERED_ORDER_THRESHOLD = 5
export const LOYAL_DELIVERED_ORDER_THRESHOLD = 3
export const NEW_CUSTOMER_DAYS = 7

export const CUSTOMER_SEGMENT_LABELS: Record<CustomerSegment, string> = {
  vip: "Khách VIP",
  loyal: "Khách thân thiết",
  new: "Khách mới",
  regular: "Khách hàng",
  no_orders: "Chưa mua",
}

export function resolveCustomerSegment(customer: {
  totalSpent: number
  deliveredOrderCount?: number
  created_at: string
}): CustomerSegment {
  const delivered = customer.deliveredOrderCount ?? 0
  if (
    customer.totalSpent >= VIP_SPENT_THRESHOLD ||
    delivered >= VIP_DELIVERED_ORDER_THRESHOLD
  ) {
    return "vip"
  }
  if (delivered >= LOYAL_DELIVERED_ORDER_THRESHOLD) {
    return "loyal"
  }
  if (isWithinDays(customer.created_at, NEW_CUSTOMER_DAYS)) {
    return "new"
  }
  return "regular"
}

export function getCustomerSegmentLabel(segment: CustomerSegment): string {
  return CUSTOMER_SEGMENT_LABELS[segment]
}

export function getCustomerSegment(customer: Customer): CustomerSegment {
  return customer.segment ?? resolveCustomerSegment(customer)
}

export function getSegmentBadgeClass(segment: CustomerSegment): string {
  switch (segment) {
    case "vip":
      return "bg-amber-500/10 text-amber-600 border-amber-500/25"
    case "loyal":
      return "bg-blue-500/10 text-blue-600 border-blue-500/25"
    case "new":
      return "bg-emerald-500/10 text-emerald-600 border-emerald-500/25"
    case "no_orders":
      return "bg-muted text-muted-foreground border-border"
    default:
      return "bg-secondary/40 text-muted-foreground border-border"
  }
}