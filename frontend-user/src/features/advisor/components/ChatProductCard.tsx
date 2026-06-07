import { Link } from "react-router"
import type { AdvisorRecommendation } from "@/types"
import { Badge } from "@/components/ui/badge"
import { Price } from "@/components/common/Price"

export function ChatProductCard({ rec }: { rec: AdvisorRecommendation }) {
  const product = rec.product

  return (
    <div className="flex gap-3 rounded-lg border border-border/80 bg-background/80 p-2.5">
      <Link to={`/product/${product.id}`} className="shrink-0">
        <img
          src={product.imageUrl}
          alt={product.title}
          loading="lazy"
          className="size-16 rounded-md object-cover"
        />
      </Link>
      <div className="min-w-0 flex-1 space-y-1">
        <Link
          to={`/product/${product.id}`}
          className="line-clamp-1 text-sm font-medium hover:text-primary"
        >
          {product.title}
        </Link>
        <Price value={product.price} originalValue={product.originalPrice} size="sm" />
        <p className="line-clamp-2 text-xs text-muted-foreground">{rec.reason}</p>
        {rec.fitTags.length > 0 && (
          <div className="flex flex-wrap gap-1">
            {rec.fitTags.slice(0, 3).map((tag) => (
              <Badge key={tag} variant="secondary" className="px-1.5 py-0 text-[10px]">
                {tag}
              </Badge>
            ))}
          </div>
        )}
      </div>
    </div>
  )
}