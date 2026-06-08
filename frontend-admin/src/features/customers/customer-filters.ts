import {
  isDateOnOrAfter,
  isWithinDays,
  matchesDateRange,
  matchesNumberRange,
  matchesTextSearch,
} from "@/lib/filters"
import type { Customer } from "@/types"

export type CustomerSegment = "all" | "vip" | "new" | "no_orders"

export interface CustomerFilterState {
  [key: string]: string
  q: string
  role: string
  segment: CustomerSegment
  ordersMin: string
  ordersMax: string
  spentMin: string
  spentMax: string
  dateFrom: string
  dateTo: string
  sort: string
}

export const CUSTOMER_FILTER_DEFAULTS: CustomerFilterState = {
  q: "",
  role: "all",
  segment: "all",
  ordersMin: "",
  ordersMax: "",
  spentMin: "",
  spentMax: "",
  dateFrom: "",
  dateTo: "",
  sort: "newest",
}

const VIP_SPENT_THRESHOLD = 5_000_000

export function filterCustomers(
  customers: Customer[],
  filters: CustomerFilterState
): Customer[] {
  const rows = customers.filter((customer) => {
    if (filters.role !== "all" && customer.role !== filters.role) return false
    if (!matchesNumberRange(customer.orderCount, filters.ordersMin, filters.ordersMax)) {
      return false
    }
    if (!matchesNumberRange(customer.totalSpent, filters.spentMin, filters.spentMax)) {
      return false
    }
    if (!matchesDateRange(customer.created_at, filters.dateFrom, filters.dateTo)) {
      return false
    }
    if (!matchesSegment(customer, filters.segment)) return false
    return matchesTextSearch(filters.q, [
      customer.name,
      customer.email,
      customer.id,
      customer.role,
    ])
  })

  return sortCustomers(rows, filters.sort)
}

function matchesSegment(customer: Customer, segment: CustomerSegment): boolean {
  switch (segment) {
    case "vip":
      return customer.totalSpent >= VIP_SPENT_THRESHOLD
    case "new":
      return isWithinDays(customer.created_at, 7)
    case "no_orders":
      return customer.orderCount === 0
    default:
      return true
  }
}

function sortCustomers(customers: Customer[], sort: string): Customer[] {
  const sorted = [...customers]
  switch (sort) {
    case "spent_desc":
      return sorted.sort((a, b) => b.totalSpent - a.totalSpent)
    case "orders_desc":
      return sorted.sort((a, b) => b.orderCount - a.orderCount)
    case "name_asc":
      return sorted.sort((a, b) => a.name.localeCompare(b.name, "vi"))
    case "oldest":
      return sorted.sort(
        (a, b) =>
          new Date(a.created_at).getTime() - new Date(b.created_at).getTime()
      )
    case "newest":
    default:
      return sorted.sort(
        (a, b) =>
          new Date(b.created_at).getTime() - new Date(a.created_at).getTime()
      )
  }
}

export { isDateOnOrAfter }