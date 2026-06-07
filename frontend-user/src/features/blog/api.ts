import { useQuery } from "@tanstack/react-query"
import { apiClient } from "@/lib/api-client"
import { queryKeys } from "@/lib/query-keys"
import type { BlogPost, BlogCategory } from "@/types"

interface BlogListParams {
  category?: string
  search?: string
  featured?: boolean
}

async function fetchBlogList(params: BlogListParams): Promise<BlogPost[]> {
  const query: Record<string, string> = {}
  if (params.category) query.category = params.category
  if (params.search) query.search = params.search
  if (params.featured) query.featured = "true"
  const { data } = await apiClient.get<BlogPost[]>("/blog", { params: query })
  return data.map((p) => ({ ...p, id: String(p.id) }))
}

async function fetchBlogCategories(): Promise<BlogCategory[]> {
  const { data } = await apiClient.get<BlogCategory[]>("/blog/categories")
  return data
}

async function fetchBlogPost(id: string): Promise<BlogPost> {
  const { data } = await apiClient.get<BlogPost>(`/blog/${id}`)
  return { ...data, id: String(data.id) }
}

export function useBlogList(params: BlogListParams) {
  return useQuery({
    queryKey: queryKeys.blog.list(params),
    queryFn: () => fetchBlogList(params),
  })
}

export function useBlogCategories() {
  return useQuery({
    queryKey: queryKeys.blog.categories,
    queryFn: fetchBlogCategories,
    staleTime: 5 * 60_000,
  })
}

export function useBlogPost(id: string) {
  return useQuery({
    queryKey: queryKeys.blog.detail(id),
    queryFn: () => fetchBlogPost(id),
    enabled: Boolean(id),
  })
}
