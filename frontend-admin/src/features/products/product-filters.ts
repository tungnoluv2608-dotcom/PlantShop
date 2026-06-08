import {
  matchesPriceRange,
  matchesStockFilter,
  matchesTextSearch,
  matchesTriState,
  type StockFilter,
  type TriState,
} from "@/lib/filters"
import type { AdminProduct } from "@/types"

export interface ProductFilterState {
  [key: string]: string
  q: string
  category: string
  stock: StockFilter
  priceMin: string
  priceMax: string
  discounted: TriState
  noPlanter: TriState
  sort: string
}

export const PRODUCT_FILTER_DEFAULTS: ProductFilterState = {
  q: "",
  category: "all",
  stock: "all",
  priceMin: "",
  priceMax: "",
  discounted: "all",
  noPlanter: "all",
  sort: "default",
}

export function filterProducts(
  products: AdminProduct[],
  filters: ProductFilterState
): AdminProduct[] {
  const rows = products.filter((product) => {
    if (filters.category !== "all" && product.category !== filters.category) {
      return false
    }
    if (!matchesStockFilter(product.inStock, filters.stock)) return false
    if (!matchesPriceRange(product.price, filters.priceMin, filters.priceMax)) {
      return false
    }
    const hasDiscount = Boolean(product.originalPrice || product.discount)
    if (!matchesTriState(hasDiscount, filters.discounted)) return false
    const hasPlanter = (product.planterOptions?.length ?? 0) > 0
    if (filters.noPlanter === "yes" && hasPlanter) return false
    if (filters.noPlanter === "no" && !hasPlanter) return false
    return matchesTextSearch(filters.q, [
      product.title,
      product.id,
      product.description,
      product.category,
    ])
  })

  return sortProducts(rows, filters.sort)
}

function sortProducts(products: AdminProduct[], sort: string): AdminProduct[] {
  const sorted = [...products]
  switch (sort) {
    case "price_asc":
      return sorted.sort((a, b) => a.price - b.price)
    case "price_desc":
      return sorted.sort((a, b) => b.price - a.price)
    case "name_asc":
      return sorted.sort((a, b) => a.title.localeCompare(b.title, "vi"))
    case "name_desc":
      return sorted.sort((a, b) => b.title.localeCompare(a.title, "vi"))
    default:
      return sorted
  }
}