import { Link } from "react-router"
import { Heart, ShoppingBag } from "lucide-react"
import type { Product } from "@/types"
import { cn } from "@/lib/utils"
import { Badge } from "@/components/ui/badge"
import { Button } from "@/components/ui/button"
import { Price } from "@/components/common/Price"
import { useCartStore } from "@/stores/cartStore"
import { encodeCartId } from "@/lib/cart-id"
import { toast } from "sonner"
import { getMaxOrderQuantity, isInStock } from "@/lib/stock"

interface ProductCardProps {
  product: Product
  isFavorite?: boolean
  onToggleFavorite?: (product: Product) => void
  enableWishlist?: boolean
  rank?: number
  className?: string
}

export function ProductCard({
  product,
  isFavorite,
  onToggleFavorite,
  enableWishlist,
  rank,
  className,
}: ProductCardProps) {
  const addItem = useCartStore((s) => s.addItem)
  const maxQuantity = getMaxOrderQuantity(product.stockQuantity, product.inStock)
  const available = isInStock(product.stockQuantity, product.inStock)
  const showWishlist = Boolean(onToggleFavorite) && (enableWishlist ?? true)

  const handleAdd = (e: React.MouseEvent) => {
    e.preventDefault()
    e.stopPropagation()
    if (!available) return
    addItem({
      id: encodeCartId({ kind: "product", productId: product.id }),
      title: product.title,
      price: product.price,
      image: product.imageUrl,
      planter: "Không",
      maxQuantity,
    })
    toast.success("Đã thêm vào giỏ hàng", { description: product.title })
  }

  return (
    <Link
      to={`/product/${product.id}`}
      className={cn(
        "group relative flex flex-col overflow-hidden rounded-xl border border-border bg-card transition-all hover:-translate-y-0.5 hover:shadow-lg",
        className,
      )}
    >
      <div className="relative aspect-square overflow-hidden bg-muted">
        <img
          src={product.imageUrl}
          alt={product.title}
          loading="lazy"
          className="size-full object-cover transition-transform duration-500 group-hover:scale-105"
        />

        {rank !== undefined && rank <= 3 && (
          <span className="absolute left-3 top-3 flex size-7 items-center justify-center rounded-full bg-primary text-xs font-bold text-primary-foreground shadow-md">
            #{rank}
          </span>
        )}

        {product.discount && (
          <Badge
            className={cn(
              "absolute bg-accent text-accent-foreground",
              rank !== undefined && rank <= 3 ? "left-12 top-3" : "left-3 top-3",
            )}
          >
            -{product.discount}
          </Badge>
        )}

        {!available && (
          <Badge variant="secondary" className="absolute right-3 top-3">
            Hết hàng
          </Badge>
        )}

        {showWishlist && (
          <button
            type="button"
            aria-label="Yêu thích"
            onClick={(e) => {
              e.preventDefault()
              e.stopPropagation()
              onToggleFavorite?.(product)
            }}
            className="absolute right-3 top-3 z-10 flex size-9 items-center justify-center rounded-full bg-background/80 text-foreground opacity-100 backdrop-blur transition-all hover:bg-background md:opacity-0 md:group-hover:opacity-100"
          >
            <Heart className={cn("size-4", isFavorite && "fill-accent text-accent")} />
          </button>
        )}

        {/* Desktop hover add-to-cart */}
        <div className="absolute inset-x-0 bottom-0 translate-y-full bg-gradient-to-t from-black/60 to-transparent p-3 transition-transform duration-300 group-hover:translate-y-0 max-md:hidden">
          <Button
            size="sm"
            className="w-full"
            onClick={handleAdd}
            disabled={!available}
          >
            <ShoppingBag className="size-4" />
            Thêm vào giỏ
          </Button>
        </div>
      </div>

      <div className="flex flex-1 flex-col gap-2 p-4">
        <span className="text-xs uppercase tracking-wide text-muted-foreground">
          {product.category}
        </span>
        <h3 className="line-clamp-2 font-medium leading-snug text-foreground">
          {product.title}
        </h3>
        <div className="mt-auto flex items-center justify-between gap-2 pt-2">
          <Price value={product.price} originalValue={product.originalPrice} />
          <Button
            size="icon"
            variant="secondary"
            className="shrink-0 md:hidden"
            onClick={handleAdd}
            disabled={!available}
            aria-label="Thêm vào giỏ"
          >
            <ShoppingBag className="size-4" />
          </Button>
        </div>
      </div>
    </Link>
  )
}