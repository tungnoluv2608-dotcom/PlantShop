import { useState } from "react"
import { useSearchParams } from "react-router"
import { Newspaper, Search } from "lucide-react"
import { Input } from "@/components/ui/input"
import { Skeleton } from "@/components/ui/skeleton"
import { Badge } from "@/components/ui/badge"
import { cn } from "@/lib/utils"
import { EmptyState } from "@/components/common/EmptyState"
import { QueryBoundary } from "@/components/common/QueryBoundary"
import { useBlogList, useBlogCategories } from "../api"
import { BlogCard } from "../components/BlogCard"

export function BlogListPage() {
  const [params, setParams] = useSearchParams()
  const category = params.get("category") ?? undefined
  const search = params.get("search") ?? undefined
  const [searchInput, setSearchInput] = useState(search ?? "")

  const { data: categories } = useBlogCategories()
  const query = useBlogList({ category, search })

  const setCategory = (value?: string) => {
    const next = new URLSearchParams(params)
    if (value) next.set("category", value)
    else next.delete("category")
    setParams(next)
  }

  const submitSearch = (e: React.FormEvent) => {
    e.preventDefault()
    const next = new URLSearchParams(params)
    const q = searchInput.trim()
    if (q) next.set("search", q)
    else next.delete("search")
    setParams(next)
  }

  return (
    <div className="mx-auto max-w-7xl px-4 py-8">
      <div className="mb-8 text-center">
        <h1 className="font-serif text-4xl font-semibold">Blog chăm cây</h1>
        <p className="mt-2 text-muted-foreground">Kiến thức và mẹo chăm sóc cây cảnh.</p>
      </div>

      <div className="mb-8 flex flex-col items-center gap-4">
        <form onSubmit={submitSearch} className="w-full max-w-md">
          <div className="relative">
            <Search className="absolute left-3 top-1/2 size-4 -translate-y-1/2 text-muted-foreground" />
            <Input
              value={searchInput}
              onChange={(e) => setSearchInput(e.target.value)}
              placeholder="Tìm bài viết..."
              className="pl-9"
            />
          </div>
        </form>

        <div className="flex flex-wrap justify-center gap-2">
          <button onClick={() => setCategory(undefined)}>
            <Badge
              variant={!category ? "default" : "outline"}
              className={cn("cursor-pointer", !category && "bg-primary")}
            >
              Tất cả
            </Badge>
          </button>
          {categories?.map((c) => (
            <button key={c.name} onClick={() => setCategory(c.name)}>
              <Badge
                variant={category === c.name ? "default" : "outline"}
                className="cursor-pointer"
              >
                {c.name} ({c.total})
              </Badge>
            </button>
          ))}
        </div>
      </div>

      <QueryBoundary
        isLoading={query.isLoading}
        isError={query.isError}
        error={query.error}
        onRetry={query.refetch}
        isEmpty={(query.data?.length ?? 0) === 0}
        loadingFallback={
          <div className="grid gap-6 sm:grid-cols-2 lg:grid-cols-3">
            {Array.from({ length: 6 }).map((_, i) => (
              <Skeleton key={i} className="h-80 rounded-xl" />
            ))}
          </div>
        }
        emptyFallback={<EmptyState icon={Newspaper} title="Không có bài viết" />}
      >
        <div className="grid gap-6 sm:grid-cols-2 lg:grid-cols-3">
          {query.data?.map((post) => (
            <BlogCard key={post.id} post={post} />
          ))}
        </div>
      </QueryBoundary>
    </div>
  )
}
