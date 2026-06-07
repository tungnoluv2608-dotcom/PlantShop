import { useQuery } from "@tanstack/react-query"
import { apiClient } from "@/lib/api-client"
import { queryKeys } from "@/lib/query-keys"
import type { Product } from "@/types"

function normalize(p: Product): Product {
  return { ...p, id: String(p.id) }
}

async function fetchProduct(id: string): Promise<Product> {
  const { data } = await apiClient.get<Product>(`/products/${id}`)
  return normalize(data)
}

async function fetchRelated(id: string, limit = 4): Promise<Product[]> {
  const { data } = await apiClient.get<Product[]>(`/products/${id}/related`, {
    params: { limit },
  })
  return data.map(normalize)
}

export function useProduct(id: string) {
  return useQuery({
    queryKey: queryKeys.products.detail(id),
    queryFn: () => fetchProduct(id),
    enabled: Boolean(id),
  })
}

export function useRelatedProducts(id: string) {
  return useQuery({
    queryKey: queryKeys.products.related(id),
    queryFn: () => fetchRelated(id),
    enabled: Boolean(id),
  })
}
