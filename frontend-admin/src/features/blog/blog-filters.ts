import {
  matchesDateRange,
  matchesTextSearch,
  matchesTriState,
  type TriState,
} from "@/lib/filters"
import type { BlogPost } from "@/types"

export interface BlogFilterState {
  [key: string]: string
  q: string
  category: string
  featured: TriState
  dateFrom: string
  dateTo: string
  sort: string
}

export const BLOG_FILTER_DEFAULTS: BlogFilterState = {
  q: "",
  category: "all",
  featured: "all",
  dateFrom: "",
  dateTo: "",
  sort: "newest",
}

export function filterBlogPosts(
  posts: BlogPost[],
  filters: BlogFilterState
): BlogPost[] {
  const rows = posts.filter((post) => {
    if (filters.category !== "all" && post.category !== filters.category) {
      return false
    }
    if (!matchesTriState(post.featured, filters.featured)) return false
    if (!matchesDateRange(post.date, filters.dateFrom, filters.dateTo)) {
      return false
    }
    return matchesTextSearch(filters.q, [
      post.title,
      post.excerpt,
      post.category,
      ...post.tags,
    ])
  })

  return sortBlogPosts(rows, filters.sort)
}

function sortBlogPosts(posts: BlogPost[], sort: string): BlogPost[] {
  const sorted = [...posts]
  switch (sort) {
    case "oldest":
      return sorted.sort((a, b) => a.date.localeCompare(b.date))
    case "title_asc":
      return sorted.sort((a, b) => a.title.localeCompare(b.title, "vi"))
    case "newest":
    default:
      return sorted.sort((a, b) => b.date.localeCompare(a.date))
  }
}