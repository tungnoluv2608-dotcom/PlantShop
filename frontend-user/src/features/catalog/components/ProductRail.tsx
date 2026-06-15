import { Link } from "react-router"
import { ArrowRight } from "lucide-react"
import type { ProductSort } from "@/types"
import { ProductCard } from "@/components/common/ProductCard"
import {
  Carousel,
  CarouselContent,
  CarouselItem,
  CarouselNext,
  CarouselPrevious,
} from "@/components/ui/carousel"
import { Skeleton } from "@/components/ui/skeleton"
import { useAuthStore } from "@/stores/authStore"
import { useWishlistStore } from "@/stores/wishlistStore"
import { useToggleWishlist } from "@/features/wishlist/api"
import { useProducts } from "../api"

interface ProductRailProps {
  title: string
  description?: string
  sort: ProductSort
  saleOnly?: boolean
  viewAllHref?: string
  showRank?: boolean
  className?: string
}

function ProductRailSkeleton() {
  return (
    <div className="flex gap-4 overflow-hidden px-10">
      {Array.from({ length: 4 }).map((_, i) => (
        <div key={i} className="w-[calc(50%-8px)] shrink-0 space-y-3 sm:w-[calc(33.333%-11px)] lg:w-[calc(25%-12px)]">
          <Skeleton className="aspect-square w-full rounded-xl" />
          <Skeleton className="h-3 w-1/3" />
          <Skeleton className="h-4 w-3/4" />
        </div>
      ))}
    </div>
  )
}

export function ProductRail({
  title,
  description,
  sort,
  saleOnly,
  viewAllHref,
  showRank,
  className,
}: ProductRailProps) {
  const { data, isLoading } = useProducts({ sort, saleOnly, pageSize: 8, page: 1 })
  const isAuthenticated = useAuthStore((s) => Boolean(s.token))
  const toggleWishlist = useToggleWishlist()
  const hasWishlist = useWishlistStore((s) => s.has)

  return (
    <section className={className}>
      <div className="mx-auto max-w-7xl px-4 py-12">
        <div className="mb-6 flex items-end justify-between gap-4">
          <div>
            <h2 className="text-2xl font-semibold sm:text-3xl">{title}</h2>
            {description && <p className="mt-1 text-muted-foreground">{description}</p>}
          </div>
          {viewAllHref && (
            <Link
              to={viewAllHref}
              className="inline-flex shrink-0 items-center gap-1 text-sm font-medium text-primary hover:underline"
            >
              Xem tất cả <ArrowRight className="size-4" />
            </Link>
          )}
        </div>

        {isLoading ? (
          <ProductRailSkeleton />
        ) : (
          <Carousel opts={{ align: "start", loop: false }} className="px-10">
            <CarouselContent className="-ml-4">
              {data?.products.map((product, index) => (
                <CarouselItem
                  key={product.id}
                  className="basis-1/2 pl-4 sm:basis-1/3 lg:basis-1/4"
                >
                  <ProductCard
                    product={product}
                    enableWishlist={isAuthenticated}
                    isFavorite={hasWishlist(product.id)}
                    onToggleFavorite={
                      isAuthenticated ? (p) => toggleWishlist.mutate(p.id) : undefined
                    }
                    rank={showRank ? index + 1 : undefined}
                  />
                </CarouselItem>
              ))}
            </CarouselContent>
            <CarouselPrevious className="-left-2 border-border bg-background shadow-md" />
            <CarouselNext className="-right-2 border-border bg-background shadow-md" />
          </Carousel>
        )}
      </div>
    </section>
  )
}