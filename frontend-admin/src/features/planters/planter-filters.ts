import {
  matchesPriceRange,
  matchesStockFilter,
  matchesTextSearch,
  type StockFilter,
} from "@/lib/filters"
import type { Planter, PlanterType } from "@/types"

export interface PlanterFilterState {
  [key: string]: string
  q: string
  material: string
  brand: string
  usageTag: string
  size: string
  stock: StockFilter
  priceMin: string
  priceMax: string
  sort: string
}

export const PLANTER_FILTER_DEFAULTS: PlanterFilterState = {
  q: "",
  material: "all",
  brand: "all",
  usageTag: "all",
  size: "all",
  stock: "all",
  priceMin: "",
  priceMax: "",
  sort: "name_asc",
}

export function filterPlanters(
  items: Planter[],
  filters: PlanterFilterState,
  type: PlanterType
): Planter[] {
  const rows = items.filter((item) => {
    if (filters.material !== "all" && item.material !== filters.material) {
      return false
    }
    if (
      type === "accessory" &&
      filters.brand !== "all" &&
      (item.accessoryBrand ?? "") !== filters.brand
    ) {
      return false
    }
    if (
      type === "accessory" &&
      filters.usageTag !== "all" &&
      !(item.usageTags ?? []).includes(filters.usageTag)
    ) {
      return false
    }
    if (
      type === "planter" &&
      filters.size !== "all" &&
      !(item.sizes ?? []).includes(filters.size)
    ) {
      return false
    }
    if (!matchesStockFilter(item.inStock, filters.stock)) return false
    if (!matchesPriceRange(item.price, filters.priceMin, filters.priceMax)) {
      return false
    }
    return matchesTextSearch(filters.q, [
      item.name,
      item.material,
      item.accessoryBrand,
      ...(item.usageTags ?? []),
      ...(item.sizes ?? []),
    ])
  })

  return sortPlanters(rows, filters.sort)
}

function sortPlanters(items: Planter[], sort: string): Planter[] {
  const sorted = [...items]
  switch (sort) {
    case "price_asc":
      return sorted.sort((a, b) => a.price - b.price)
    case "price_desc":
      return sorted.sort((a, b) => b.price - a.price)
    case "name_desc":
      return sorted.sort((a, b) => b.name.localeCompare(a.name, "vi"))
    case "name_asc":
    default:
      return sorted.sort((a, b) => a.name.localeCompare(b.name, "vi"))
  }
}