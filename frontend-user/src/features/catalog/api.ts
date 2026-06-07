import { useQuery } from "@tanstack/react-query"
import { apiClient } from "@/lib/api-client"
import { queryKeys } from "@/lib/query-keys"
import type {
  Category,
  Product,
  ProductFilters,
  ProductListResponse,
  ProductSearchResult,
} from "@/types"

function normalizeProduct(p: Product): Product {
  return { ...p, id: String(p.id) }
}

async function fetchProducts(filters: ProductFilters): Promise<ProductListResponse> {
  const params: Record<string, string | number> = {}
  if (filters.category) params.category = filters.category
  if (filters.search) params.search = filters.search
  if (typeof filters.minPrice === "number") params.minPrice = filters.minPrice
  if (typeof filters.maxPrice === "number") params.maxPrice = filters.maxPrice
  params.page = filters.page ?? 1
  params.pageSize = filters.pageSize ?? 9
  if (filters.sort) params.sort = filters.sort
  if (filters.saleOnly) params.saleOnly = "true"

  const { data } = await apiClient.get<ProductListResponse>("/products", { params })
  return { products: data.products.map(normalizeProduct), total: data.total }
}

async function fetchCategories(): Promise<Category[]> {
  const { data } = await apiClient.get<Category[]>("/categories")
  return data.map((c) => ({ ...c, id: String(c.id) }))
}

async function searchProducts(q: string, limit = 6): Promise<ProductSearchResult[]> {
  const { data } = await apiClient.get<ProductSearchResult[]>("/products/search", {
    params: { q, limit },
  })
  return data.map((r) => ({ ...r, id: String(r.id) }))
}

export function useProducts(filters: ProductFilters) {
  return useQuery({
    queryKey: queryKeys.products.list(filters),
    queryFn: () => fetchProducts(filters),
  })
}

export function useCategories() {
  return useQuery({
    queryKey: queryKeys.categories.all,
    queryFn: fetchCategories,
    staleTime: 5 * 60_000,
  })
}

export function useProductSearch(q: string) {
  return useQuery({
    queryKey: queryKeys.products.search(q),
    queryFn: () => searchProducts(q),
    enabled: q.trim().length >= 2,
  })
}
