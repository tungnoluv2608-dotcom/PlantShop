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
  className?: string
}

export function ProductCard({ product, isFavorite, onToggleFavorite, className }: ProductCardProps) {
  const addItem = useCartStore((s) => s.addItem)
  const maxQuantity = getMaxOrderQuantity(product.stockQuantity, product.inStock)
  const available = isInStock(product.stockQuantity, product.inStock)

  const handleAdd = (e: React.MouseEvent) => {
    e.preventDefault()
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
        "group relative flex flex-col overflow-hidden rounded-xl border border-border bg-card transition-shadow hover:shadow-lg",
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
        {product.discount && (
          <Badge className="absolute left-3 top-3 bg-accent text-accent-foreground">
            -{product.discount}
          </Badge>
        )}
        {!available && (
          <Badge variant="secondary" className="absolute right-3 top-3">
            Hết hàng
          </Badge>
        )}
        {onToggleFavorite && (
          <button
            type="button"
            aria-label="Yêu thích"
            onClick={(e) => {
              e.preventDefault()
              onToggleFavorite(product)
            }}
            className="absolute right-3 top-3 flex size-9 items-center justify-center rounded-full bg-background/80 text-foreground backdrop-blur transition-colors hover:bg-background"
          >
            <Heart
              className={cn("size-4", isFavorite && "fill-accent text-accent")}
            />
          </button>
        )}
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
            className="shrink-0"
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
