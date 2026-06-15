import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query"
import { apiClient } from "@/lib/api-client"
import { queryKeys } from "@/lib/query-keys"
import type {
  AdminProduct,
  ProductDetail,
  ProductPayload,
  MessageResponse,
} from "@/types"

export function useAdminProducts(options?: { enabled?: boolean }) {
  return useQuery({
    queryKey: queryKeys.products.all,
    enabled: options?.enabled ?? true,
    queryFn: async () => {
      const { data } = await apiClient.get<AdminProduct[]>("/admin/products")
      return data
    },
  })
}

/** Full product detail (gallery + care guide) for prefilling the edit form. */
export function useProductDetail(id: string | undefined) {
  return useQuery({
    queryKey: queryKeys.products.detail(id ?? ""),
    enabled: Boolean(id),
    queryFn: async () => {
      const { data } = await apiClient.get<ProductDetail>(`/products/${id}`)
      return data
    },
  })
}

export function useCreateProduct() {
  const qc = useQueryClient()
  return useMutation({
    mutationFn: async (payload: ProductPayload) => {
      const { data } = await apiClient.post<{ id: number; message: string }>(
        "/admin/products",
        payload
      )
      return data
    },
    onSuccess: () => qc.invalidateQueries({ queryKey: queryKeys.products.all }),
  })
}

export function useUpdateProduct() {
  const qc = useQueryClient()
  return useMutation({
    mutationFn: async ({ id, payload }: { id: string; payload: ProductPayload }) => {
      const { data } = await apiClient.put<MessageResponse>(
        `/admin/products/${id}`,
        payload
      )
      return data
    },
    onSuccess: (_data, { id }) => {
      qc.invalidateQueries({ queryKey: queryKeys.products.all })
      qc.invalidateQueries({ queryKey: queryKeys.products.detail(id) })
    },
  })
}

export function useDeleteProduct() {
  const qc = useQueryClient()
  return useMutation({
    mutationFn: async (id: string) => {
      const { data } = await apiClient.delete<MessageResponse>(
        `/admin/products/${id}`
      )
      return data
    },
    onSuccess: () => qc.invalidateQueries({ queryKey: queryKeys.products.all }),
  })
}
