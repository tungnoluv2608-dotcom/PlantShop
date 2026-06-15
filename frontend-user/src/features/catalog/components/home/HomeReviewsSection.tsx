import { Link } from "react-router"
import { MessageSquare, Quote } from "lucide-react"
import {
  Carousel,
  CarouselContent,
  CarouselItem,
  CarouselNext,
  CarouselPrevious,
} from "@/components/ui/carousel"
import { Skeleton } from "@/components/ui/skeleton"
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar"
import { Badge } from "@/components/ui/badge"
import { RatingStars } from "@/components/common/RatingStars"
import { useFeaturedReviews } from "@/features/reviews/hooks/useFeaturedReviews"

export function HomeReviewsSection() {
  const { reviews, isLoading } = useFeaturedReviews(6)

  if (!isLoading && reviews.length === 0) return null

  return (
    <section className="border-y border-border bg-secondary/20 py-12">
      <div className="mx-auto max-w-7xl px-4">
        <div className="mb-8 text-center">
          <h2 className="text-2xl font-semibold sm:text-3xl">Khách hàng nói gì</h2>
          <p className="mt-1 text-muted-foreground">
            Đánh giá thực tế từ những người đã mua và chăm cây cùng PlantShop
          </p>
        </div>

        {isLoading ? (
          <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
            {Array.from({ length: 3 }).map((_, i) => (
              <Skeleton key={i} className="h-44 rounded-xl" />
            ))}
          </div>
        ) : (
          <Carousel opts={{ align: "start", loop: true }} className="px-10">
            <CarouselContent className="-ml-4">
              {reviews.map((review) => (
                <CarouselItem
                  key={review.id}
                  className="basis-full pl-4 sm:basis-1/2 lg:basis-1/3"
                >
                  <article className="flex h-full flex-col rounded-xl border border-border bg-card p-5 shadow-sm">
                    <Quote className="size-8 text-primary/30" />
                    <p className="mt-3 flex-1 text-sm leading-relaxed text-muted-foreground">
                      &ldquo;{review.content}&rdquo;
                    </p>
                    <div className="mt-4 flex items-center gap-3 border-t border-border pt-4">
                      <Avatar className="size-9">
                        <AvatarImage src={review.avatar} alt={review.userName} />
                        <AvatarFallback>{review.userName.charAt(0)}</AvatarFallback>
                      </Avatar>
                      <div className="min-w-0 flex-1">
                        <div className="flex items-center gap-2">
                          <span className="truncate text-sm font-medium">{review.userName}</span>
                          {review.verified && (
                            <Badge variant="secondary" className="shrink-0 text-[10px]">
                              Đã mua
                            </Badge>
                          )}
                        </div>
                        <RatingStars value={review.rating} size={12} className="mt-0.5" />
                      </div>
                    </div>
                  </article>
                </CarouselItem>
              ))}
            </CarouselContent>
            <CarouselPrevious className="-left-2 border-border bg-background shadow-md" />
            <CarouselNext className="-right-2 border-border bg-background shadow-md" />
          </Carousel>
        )}

        <div className="mt-6 text-center">
          <Link
            to="/shop?sort=best-selling"
            className="inline-flex items-center gap-1.5 text-sm font-medium text-primary hover:underline"
          >
            <MessageSquare className="size-4" />
            Xem sản phẩm được đánh giá cao
          </Link>
        </div>
      </div>
    </section>
  )
}