import { Link } from "react-router"
import { Clock } from "lucide-react"
import type { BlogPost } from "@/types"
import { Badge } from "@/components/ui/badge"
import { formatDate } from "@/lib/format"

export function BlogCard({ post }: { post: BlogPost }) {
  return (
    <Link
      to={`/blog/${post.id}`}
      className="group flex flex-col overflow-hidden rounded-xl border border-border bg-card transition-shadow hover:shadow-lg"
    >
      <div className="aspect-[16/10] overflow-hidden bg-muted">
        <img
          src={post.image}
          alt={post.title}
          loading="lazy"
          className="size-full object-cover transition-transform duration-500 group-hover:scale-105"
        />
      </div>
      <div className="flex flex-1 flex-col gap-2 p-5">
        <div className="flex items-center gap-2">
          <Badge variant="secondary">{post.category}</Badge>
          {post.featured && <Badge className="bg-accent text-accent-foreground">Nổi bật</Badge>}
        </div>
        <h3 className="line-clamp-2 font-serif text-lg font-semibold leading-snug group-hover:text-primary">
          {post.title}
        </h3>
        <p className="line-clamp-2 text-sm text-muted-foreground">{post.excerpt}</p>
        <div className="mt-auto flex items-center gap-3 pt-2 text-xs text-muted-foreground">
          <span>{formatDate(post.date)}</span>
          {post.readTime && (
            <span className="flex items-center gap-1">
              <Clock className="size-3" /> {post.readTime}
            </span>
          )}
        </div>
      </div>
    </Link>
  )
}
