import { BadgeCheck } from "lucide-react"
import type { Review } from "@/types"
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar"
import { Badge } from "@/components/ui/badge"
import { RatingStars } from "@/components/common/RatingStars"
import { formatDate } from "@/lib/format"

export function ReviewCard({ review }: { review: Review }) {
  return (
    <div className="space-y-3 border-b border-border py-5 last:border-0">
      <div className="flex items-start gap-3">
        <Avatar className="size-10">
          <AvatarImage src={review.avatar} alt={review.userName} />
          <AvatarFallback>{review.userName.charAt(0)}</AvatarFallback>
        </Avatar>
        <div className="flex-1">
          <div className="flex items-center gap-2">
            <span className="font-medium">{review.userName}</span>
            {review.verified && (
              <Badge variant="secondary" className="gap-1 text-xs">
                <BadgeCheck className="size-3" /> Đã mua hàng
              </Badge>
            )}
          </div>
          <div className="mt-1 flex items-center gap-2">
            <RatingStars value={review.rating} size={14} />
            <span className="text-xs text-muted-foreground">{formatDate(review.date)}</span>
          </div>
        </div>
      </div>

      <div>
        <h4 className="font-medium">{review.title}</h4>
        <p className="mt-1 text-sm text-muted-foreground">{review.content}</p>
      </div>

      {review.images.length > 0 && (
        <div className="flex flex-wrap gap-2">
          {review.images.map((img, i) => (
            <img
              key={i}
              src={img}
              alt={`Ảnh đánh giá ${i + 1}`}
              loading="lazy"
              className="size-20 rounded-lg object-cover"
            />
          ))}
        </div>
      )}

      {review.tags.length > 0 && (
        <div className="flex flex-wrap gap-1.5">
          {review.tags.map((tag) => (
            <Badge key={tag} variant="outline" className="text-xs">
              {tag}
            </Badge>
          ))}
        </div>
      )}
    </div>
  )
}
