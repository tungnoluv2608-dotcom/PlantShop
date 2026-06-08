/** Shared client-side filter utilities for admin list pages. */

export function normalizeSearchQuery(query: string): string {
  return query.trim().toLowerCase()
}

export function matchesTextSearch(
  query: string,
  fields: Array<string | number | null | undefined>
): boolean {
  const q = normalizeSearchQuery(query)
  if (!q) return true
  return fields.some((field) => String(field ?? "").toLowerCase().includes(q))
}

export type StockFilter = "all" | "in_stock" | "out_of_stock"

export function matchesStockFilter(inStock: boolean, filter: StockFilter): boolean {
  if (filter === "all") return true
  return filter === "in_stock" ? inStock : !inStock
}

export type TriState = "all" | "yes" | "no"

export function matchesTriState(value: boolean, filter: TriState): boolean {
  if (filter === "all") return true
  return filter === "yes" ? value : !value
}

export function matchesPriceRange(
  price: number,
  min?: string,
  max?: string
): boolean {
  const minNum = min?.trim() ? Number(min) : null
  const maxNum = max?.trim() ? Number(max) : null
  if (minNum !== null && !Number.isNaN(minNum) && price < minNum) return false
  if (maxNum !== null && !Number.isNaN(maxNum) && price > maxNum) return false
  return true
}

export function matchesNumberRange(
  value: number,
  min?: string,
  max?: string
): boolean {
  return matchesPriceRange(value, min, max)
}

export function matchesDateRange(
  dateStr: string,
  from?: string,
  to?: string
): boolean {
  if (!from?.trim() && !to?.trim()) return true
  const date = new Date(dateStr)
  if (Number.isNaN(date.getTime())) return true

  if (from?.trim()) {
    const fromDate = new Date(from)
    fromDate.setHours(0, 0, 0, 0)
    if (!Number.isNaN(fromDate.getTime()) && date < fromDate) return false
  }

  if (to?.trim()) {
    const toDate = new Date(to)
    toDate.setHours(23, 59, 59, 999)
    if (!Number.isNaN(toDate.getTime()) && date > toDate) return false
  }

  return true
}

export function uniqueSorted(values: string[]): string[] {
  return Array.from(new Set(values.filter(Boolean))).sort((a, b) =>
    a.localeCompare(b, "vi")
  )
}

export function daysAgo(days: number): Date {
  const d = new Date()
  d.setDate(d.getDate() - days)
  d.setHours(0, 0, 0, 0)
  return d
}

export function isWithinDays(dateStr: string, days: number): boolean {
  const date = new Date(dateStr)
  if (Number.isNaN(date.getTime())) return false
  return date >= daysAgo(days)
}

export function parseDateOnly(value: string): Date | null {
  const date = new Date(value)
  if (Number.isNaN(date.getTime())) return null
  date.setHours(0, 0, 0, 0)
  return date
}

export function isFilterActive(value: string, defaultValue: string): boolean {
  return value !== defaultValue && value !== ""
}

export function isDateOnOrAfter(dateStr: string, minDate: Date): boolean {
  const date = parseDateOnly(dateStr)
  if (!date) return false
  return date >= minDate
}