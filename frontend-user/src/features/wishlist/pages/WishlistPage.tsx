import { Link } from "react-router"
import { Heart } from "lucide-react"
import { Button } from "@/components/ui/button"
import { ProductCard } from "@/components/common/ProductCard"
import { EmptyState } from "@/components/common/EmptyState"
import { QueryBoundary } from "@/components/common/QueryBoundary"
import { ProductGridSkeleton } from "@/features/catalog/components/ProductGridSkeleton"
import { useWishlistStore } from "@/stores/wishlistStore"
import { useWishlist, useToggleWishlist } from "../api"

export function WishlistPage() {
  const query = useWishlist()
  const toggleWishlist = useToggleWishlist()
  const has = useWishlistStore((s) => s.has)

  return (
    <div className="mx-auto max-w-7xl px-4 py-8">
      <h1 className="mb-6 text-3xl font-semibold">Danh sách yêu thích</h1>
      <QueryBoundary
        isLoading={query.isLoading}
        isError={query.isError}
        error={query.error}
        onRetry={query.refetch}
        isEmpty={(query.data?.length ?? 0) === 0}
        loadingFallback={<ProductGridSkeleton count={8} />}
        emptyFallback={
          <EmptyState
            icon={Heart}
            title="Chưa có sản phẩm yêu thích"
            description="Nhấn vào trái tim trên sản phẩm để lưu lại."
            action={
              <Button asChild>
                <Link to="/shop">Khám phá cửa hàng</Link>
              </Button>
            }
          />
        }
      >
        <div className="grid grid-cols-2 gap-4 sm:grid-cols-3 lg:grid-cols-4">
          {query.data?.map((product) => (
            <ProductCard
              key={product.id}
              product={product}
              isFavorite={has(product.id)}
              onToggleFavorite={(p) => toggleWishlist.mutate(p.id)}
            />
          ))}
        </div>
      </QueryBoundary>
    </div>
  )
}
