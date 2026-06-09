import {
  matchesDateRange,
  matchesNumberRange,
  matchesTriState,
  type TriState,
} from "@/lib/filters"
import type { AdminOrderRow, OrderStatus, TrackingProvider } from "@/types"
import { matchesOrderSearch } from "./order-search"

export interface OrderFilterState {
  [key: string]: string
  q: string
  customerId: string
  status: string
  payment: string
  tracking: TriState
  provider: string
  dateFrom: string
  dateTo: string
  totalMin: string
  totalMax: string
}

export const ORDER_FILTER_DEFAULTS: OrderFilterState = {
  q: "",
  customerId: "",
  status: "all",
  payment: "all",
  tracking: "all",
  provider: "all",
  dateFrom: "",
  dateTo: "",
  totalMin: "",
  totalMax: "",
}

export function filterOrders(
  orders: AdminOrderRow[],
  filters: OrderFilterState
): AdminOrderRow[] {
  return orders.filter((order) => {
    if (
      filters.customerId &&
      String(order.userId ?? "") !== filters.customerId
    ) {
      return false
    }
    if (filters.status !== "all" && order.status !== filters.status) {
      return false
    }
    if (
      filters.payment !== "all" &&
      order.paymentMethod !== filters.payment
    ) {
      return false
    }
    const hasTracking = Boolean(order.trackingNumber?.trim())
    if (!matchesTriState(hasTracking, filters.tracking)) return false
    if (
      filters.provider !== "all" &&
      order.trackingProvider !== (filters.provider as TrackingProvider)
    ) {
      return false
    }
    if (!matchesDateRange(order.date, filters.dateFrom, filters.dateTo)) {
      return false
    }
    if (!matchesNumberRange(order.total, filters.totalMin, filters.totalMax)) {
      return false
    }
    return matchesOrderSearch(order, filters.q)
  })
}

export function countOrdersByStatus(
  orders: AdminOrderRow[]
): Partial<Record<OrderStatus | "all", number>> {
  const counts: Partial<Record<OrderStatus | "all", number>> = {
    all: orders.length,
  }
  for (const order of orders) {
    counts[order.status] = (counts[order.status] ?? 0) + 1
  }
  return counts
}