import { matchesDateRange, matchesTextSearch } from "@/lib/filters"
import type { WholesaleInquiry, WholesaleStatus } from "@/types"

export interface WholesaleFilterState {
  [key: string]: string
  q: string
  status: string
  assigned: string
  source: string
  dateFrom: string
  dateTo: string
}

export const WHOLESALE_FILTER_DEFAULTS: WholesaleFilterState = {
  q: "",
  status: "all",
  assigned: "all",
  source: "all",
  dateFrom: "",
  dateTo: "",
}

export function filterWholesaleInquiries(
  inquiries: WholesaleInquiry[],
  filters: WholesaleFilterState
): WholesaleInquiry[] {
  return inquiries.filter((inquiry) => {
    if (filters.status !== "all" && inquiry.status !== filters.status) {
      return false
    }
    if (filters.assigned === "unassigned" && inquiry.assignedTo?.trim()) {
      return false
    }
    if (
      filters.assigned !== "all" &&
      filters.assigned !== "unassigned" &&
      inquiry.assignedTo !== filters.assigned
    ) {
      return false
    }
    if (filters.source !== "all" && inquiry.source !== filters.source) {
      return false
    }
    if (!matchesDateRange(inquiry.createdAt, filters.dateFrom, filters.dateTo)) {
      return false
    }
    return matchesTextSearch(filters.q, [
      inquiry.company,
      inquiry.contact,
      inquiry.email,
      inquiry.phone,
      inquiry.note,
      inquiry.location,
    ])
  })
}

export function countWholesaleByStatus(
  inquiries: WholesaleInquiry[]
): Partial<Record<WholesaleStatus | "all", number>> {
  const counts: Partial<Record<WholesaleStatus | "all", number>> = {
    all: inquiries.length,
  }
  for (const inquiry of inquiries) {
    counts[inquiry.status] = (counts[inquiry.status] ?? 0) + 1
  }
  return counts
}