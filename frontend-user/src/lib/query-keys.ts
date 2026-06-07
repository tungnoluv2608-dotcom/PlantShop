import type { ProductFilters, PlanterType } from "@/types"

/**
 * Centralized query key factory — prevents cache-key drift across features.
 * Use these everywhere instead of inline arrays.
 */
export const queryKeys = {
  products: {
    all: ["products"] as const,
    list: (filters: ProductFilters) => ["products", "list", filters] as const,
    search: (q: string) => ["products", "search", q] as const,
    detail: (id: string) => ["products", "detail", id] as const,
    related: (id: string) => ["products", "related", id] as const,
  },
  categories: {
    all: ["categories"] as const,
  },
  planters: {
    list: (type: PlanterType) => ["planters", "list", type] as const,
    detail: (id: string, type?: PlanterType) => ["planters", "detail", id, type] as const,
  },
  blog: {
    list: (params: { category?: string; search?: string; featured?: boolean }) =>
      ["blog", "list", params] as const,
    categories: ["blog", "categories"] as const,
    detail: (id: string) => ["blog", "detail", id] as const,
  },
  reviews: {
    byProduct: (productId: string) => ["reviews", productId] as const,
  },
  orders: {
    all: ["orders"] as const,
    detail: (id: string) => ["orders", "detail", id] as const,
  },
  wishlist: {
    all: ["wishlist"] as const,
  },
  addresses: {
    all: ["addresses"] as const,
  },

} as const
