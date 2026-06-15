import { Link } from "react-router"
import { ArrowRight } from "lucide-react"
import { Skeleton } from "@/components/ui/skeleton"
import { BlogCard } from "@/features/blog/components/BlogCard"
import { useBlogList } from "@/features/blog/api"

export function BlogPreview() {
  const { data, isLoading } = useBlogList({ featured: true })

  const posts = data?.slice(0, 3) ?? []

  if (!isLoading && posts.length === 0) return null

  return (
    <section className="mx-auto max-w-7xl px-4 py-12">
      <div className="mb-8 flex items-end justify-between gap-4">
        <div>
          <h2 className="text-2xl font-semibold sm:text-3xl">Chăm cây mỗi ngày</h2>
          <p className="mt-1 text-muted-foreground">
            Mẹo tưới nước, chọn chậu và chăm sóc cây từ chuyên gia
          </p>
        </div>
        <Link
          to="/blog"
          className="inline-flex shrink-0 items-center gap-1 text-sm font-medium text-primary hover:underline"
        >
          Xem blog <ArrowRight className="size-4" />
        </Link>
      </div>

      {isLoading ? (
        <div className="grid gap-6 sm:grid-cols-2 lg:grid-cols-3">
          {Array.from({ length: 3 }).map((_, i) => (
            <div key={i} className="space-y-3">
              <Skeleton className="aspect-[16/10] w-full rounded-xl" />
              <Skeleton className="h-4 w-1/3" />
              <Skeleton className="h-6 w-4/5" />
            </div>
          ))}
        </div>
      ) : (
        <div className="grid gap-6 sm:grid-cols-2 lg:grid-cols-3">
          {posts.map((post) => (
            <BlogCard key={post.id} post={post} />
          ))}
        </div>
      )}
    </section>
  )
}