import { useState } from "react"
import { Link } from "react-router"
import { MessageSquare } from "lucide-react"
import { Button } from "@/components/ui/button"
import { Skeleton } from "@/components/ui/skeleton"
import { RatingStars } from "@/components/common/RatingStars"
import { EmptyState } from "@/components/common/EmptyState"
import { useAuthStore } from "@/stores/authStore"
import { useReviews } from "../api"
import { ReviewCard } from "./ReviewCard"
import { ReviewForm } from "./ReviewForm"

export function ReviewsSection({ productId }: { productId: string }) {
  const { data: reviews, isLoading } = useReviews(productId)
  const isAuthenticated = useAuthStore((s) => Boolean(s.token))
  const [showForm, setShowForm] = useState(false)

  const avgRating =
    reviews && reviews.length > 0
      ? reviews.reduce((sum, r) => sum + r.rating, 0) / reviews.length
      : 0

  return (
    <section className="space-y-5">
      <div className="flex items-center justify-between gap-4">
        <div>
          <h2 className="text-2xl font-semibold">Đánh giá</h2>
          {reviews && reviews.length > 0 && (
            <div className="mt-1 flex items-center gap-2">
              <RatingStars value={avgRating} />
              <span className="text-sm text-muted-foreground">
                {avgRating.toFixed(1)} · {reviews.length} đánh giá
              </span>
            </div>
          )}
        </div>
        {isAuthenticated ? (
          <Button variant="outline" onClick={() => setShowForm((v) => !v)}>
            {showForm ? "Đóng" : "Viết đánh giá"}
          </Button>
        ) : (
          <Button asChild variant="outline">
            <Link to="/signin">Đăng nhập để đánh giá</Link>
          </Button>
        )}
      </div>

      {showForm && isAuthenticated && (
        <ReviewForm productId={productId} onDone={() => setShowForm(false)} />
      )}

      {isLoading ? (
        <div className="space-y-4">
          {Array.from({ length: 3 }).map((_, i) => (
            <Skeleton key={i} className="h-24 w-full" />
          ))}
        </div>
      ) : reviews && reviews.length > 0 ? (
        <div className="divide-y divide-border">
          {reviews.map((review) => (
            <ReviewCard key={review.id} review={review} />
          ))}
        </div>
      ) : (
        <EmptyState
          icon={MessageSquare}
          title="Chưa có đánh giá"
          description="Hãy là người đầu tiên đánh giá sản phẩm này."
        />
      )}
    </section>
  )
}
