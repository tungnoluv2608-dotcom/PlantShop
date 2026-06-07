import { Link } from "react-router"
import type { AdvisorRecommendation } from "@/types"
import { Badge } from "@/components/ui/badge"
import { Price } from "@/components/common/Price"

export function RecommendationCard({ rec }: { rec: AdvisorRecommendation }) {
  const product = rec.product
  return (
    <div className="flex gap-4 rounded-xl border border-border bg-card p-4">
      <Link to={`/product/${product.id}`} className="shrink-0">
        <img
          src={product.imageUrl}
          alt={product.title}
          loading="lazy"
          className="size-24 rounded-lg object-cover"
        />
      </Link>
      <div className="flex-1 space-y-1.5">
        <Link to={`/product/${product.id}`} className="font-medium hover:text-primary">
          {product.title}
        </Link>
        <Price value={product.price} originalValue={product.originalPrice} size="sm" />
        <p className="text-sm text-muted-foreground">{rec.reason}</p>
        {rec.fitTags.length > 0 && (
          <div className="flex flex-wrap gap-1.5 pt-1">
            {rec.fitTags.map((tag) => (
              <Badge key={tag} variant="secondary" className="text-xs">
                {tag}
              </Badge>
            ))}
          </div>
        )}
      </div>
    </div>
  )
}
