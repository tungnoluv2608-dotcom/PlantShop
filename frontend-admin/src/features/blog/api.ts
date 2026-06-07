import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query"
import { apiClient } from "@/lib/api-client"
import { queryKeys } from "@/lib/query-keys"
import type {
  BlogPost,
  BlogPayload,
  BlogAiDraft,
  BlogAiDraftRequest,
  MessageResponse,
} from "@/types"

export function useBlogPosts() {
  return useQuery({
    queryKey: queryKeys.blog.all,
    queryFn: async () => {
      const { data } = await apiClient.get<BlogPost[]>("/admin/blog")
      return data
    },
  })
}

export function useBlogPost(id: string | undefined) {
  return useQuery({
    queryKey: queryKeys.blog.detail(id ?? ""),
    enabled: Boolean(id),
    queryFn: async () => {
      const { data } = await apiClient.get<BlogPost>(`/blog/${id}`)
      return data
    },
  })
}

export function useCreateBlog() {
  const qc = useQueryClient()
  return useMutation({
    mutationFn: async (payload: BlogPayload) => {
      const { data } = await apiClient.post<MessageResponse>("/admin/blog", payload)
      return data
    },
    onSuccess: () => qc.invalidateQueries({ queryKey: queryKeys.blog.all }),
  })
}

export function useUpdateBlog() {
  const qc = useQueryClient()
  return useMutation({
    mutationFn: async ({ id, payload }: { id: string; payload: BlogPayload }) => {
      const { data } = await apiClient.put<MessageResponse>(
        `/admin/blog/${id}`,
        payload
      )
      return data
    },
    onSuccess: (_data, { id }) => {
      qc.invalidateQueries({ queryKey: queryKeys.blog.all })
      qc.invalidateQueries({ queryKey: queryKeys.blog.detail(id) })
    },
  })
}

export function useDeleteBlog() {
  const qc = useQueryClient()
  return useMutation({
    mutationFn: async (id: string) => {
      const { data } = await apiClient.delete<MessageResponse>(`/admin/blog/${id}`)
      return data
    },
    onSuccess: () => qc.invalidateQueries({ queryKey: queryKeys.blog.all }),
  })
}

export function useGenerateAiDraft() {
  return useMutation({
    mutationFn: async (req: BlogAiDraftRequest) => {
      const { data } = await apiClient.post<{ draft: BlogAiDraft }>(
        "/admin/blog/ai-draft",
        req
      )
      return data.draft
    },
  })
}
