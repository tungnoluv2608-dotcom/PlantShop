import { Link, useParams } from "react-router"
import { ArrowLeft, Clock } from "lucide-react"
import { Badge } from "@/components/ui/badge"
import { Button } from "@/components/ui/button"
import { Skeleton } from "@/components/ui/skeleton"
import { Markdown } from "@/components/common/Markdown"
import { formatDate } from "@/lib/format"
import { useBlogPost } from "../api"

export function BlogDetailPage() {
  const { id = "" } = useParams()
  const { data: post, isLoading } = useBlogPost(id)

  if (isLoading) {
    return (
      <div className="mx-auto max-w-3xl space-y-4 px-4 py-8">
        <Skeleton className="h-8 w-3/4" />
        <Skeleton className="aspect-[16/9] w-full rounded-xl" />
        <Skeleton className="h-64 w-full" />
      </div>
    )
  }

  if (!post) {
    return (
      <div className="mx-auto max-w-2xl px-4 py-24 text-center">
        <p className="text-muted-foreground">Không tìm thấy bài viết.</p>
        <Button asChild className="mt-4">
          <Link to="/blog">Về trang Blog</Link>
        </Button>
      </div>
    )
  }

  return (
    <article className="mx-auto max-w-3xl px-4 py-8">
      <Button asChild variant="ghost" size="sm" className="mb-4">
        <Link to="/blog">
          <ArrowLeft className="size-4" /> Tất cả bài viết
        </Link>
      </Button>

      <div className="space-y-3">
        <div className="flex items-center gap-2">
          <Badge variant="secondary">{post.category}</Badge>
          {post.featured && <Badge className="bg-accent text-accent-foreground">Nổi bật</Badge>}
        </div>
        <h1 className="font-serif text-4xl font-semibold leading-tight">{post.title}</h1>
        <div className="flex items-center gap-3 text-sm text-muted-foreground">
          <span>{formatDate(post.date)}</span>
          {post.readTime && (
            <span className="flex items-center gap-1">
              <Clock className="size-3.5" /> {post.readTime}
            </span>
          )}
        </div>
      </div>

      <img
        src={post.image}
        alt={post.title}
        className="my-8 aspect-[16/9] w-full rounded-2xl object-cover"
      />

      <Markdown>{post.content}</Markdown>

      {post.tags.length > 0 && (
        <div className="mt-10 flex flex-wrap gap-2 border-t border-border pt-6">
          {post.tags.map((tag) => (
            <Badge key={tag} variant="outline">
              #{tag}
            </Badge>
          ))}
        </div>
      )}
    </article>
  )
}
