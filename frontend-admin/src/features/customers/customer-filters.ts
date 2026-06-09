import {
  matchesDateRange,
  matchesNumberRange,
  matchesTextSearch,
} from "@/lib/filters"
import type { Customer, CustomerSegment } from "@/types"
import { resolveCustomerSegment } from "./customer-segments"

export type CustomerListSegment = CustomerSegment | "all"

export interface CustomerFilterState {
  [key: string]: string
  q: string
  segment: CustomerListSegment
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
  segment: "all",
  ordersMin: "",
  ordersMax: "",
  spentMin: "",
  spentMax: "",
  dateFrom: "",
  dateTo: "",
  sort: "newest",
}

export function filterCustomers(
  customers: Customer[],
  filters: CustomerFilterState
): Customer[] {
  const rows = customers.filter((customer) => {
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
      customer.phone ?? "",
    ])
  })

  return sortCustomers(rows, filters.sort)
}

function matchesSegment(
  customer: Customer,
  segment: CustomerListSegment
): boolean {
  switch (segment) {
    case "vip":
      return resolveCustomerSegment(customer) === "vip"
    case "new":
      return resolveCustomerSegment(customer) === "new"
    case "no_orders":
      return customer.orderCount === 0
    case "all":
      return true
    default:
      return (customer.segment ?? resolveCustomerSegment(customer)) === segment
  }
}

function sortCustomers(customers: Customer[], sort: string): Customer[] {
  const sorted = [...customers]
  switch (sort) {
    case "spent_desc":
      return sorted.sort((a, b) => b.totalSpent - a.totalSpent)
    case "orders_desc":
      return sorted.sort((a, b) => b.orderCount - a.orderCount)
    case "last_order_desc":
      return sorted.sort((a, b) => {
        const aTime = a.lastOrderDate ? new Date(a.lastOrderDate).getTime() : 0
        const bTime = b.lastOrderDate ? new Date(b.lastOrderDate).getTime() : 0
        return bTime - aTime
      })
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