import { useEffect, useMemo, useState } from "react"
import { useNavigate, useParams, Link } from "react-router"
import { Heart, Minus, Plus, ShoppingBag, Truck, Leaf } from "lucide-react"
import { toast } from "sonner"
import { Button } from "@/components/ui/button"
import { Badge } from "@/components/ui/badge"
import { Separator } from "@/components/ui/separator"
import {
  Accordion,
  AccordionContent,
  AccordionItem,
  AccordionTrigger,
} from "@/components/ui/accordion"
import { Skeleton } from "@/components/ui/skeleton"
import { Price } from "@/components/common/Price"
import { ProductCard } from "@/components/common/ProductCard"
import { cn } from "@/lib/utils"
import { formatVND } from "@/lib/format"
import { encodeCartId } from "@/lib/cart-id"
import { useCartStore } from "@/stores/cartStore"
import { useAuthStore } from "@/stores/authStore"
import { useWishlistStore } from "@/stores/wishlistStore"
import { usePlanters } from "@/features/planters/api"
import { useToggleWishlist } from "@/features/wishlist/api"
import { ReviewsSection } from "@/features/reviews/components/ReviewsSection"
import { useProduct, useRelatedProducts } from "../api"
import { ProductGallery } from "../components/ProductGallery"
import { PlanterAddOnSelector } from "../components/PlanterAddOnSelector"
import {
  clampOrderQuantity,
  formatStockLabel,
  getMaxOrderQuantity,
} from "@/lib/stock"

export function ProductDetailPage() {
  const { id = "" } = useParams()
  const navigate = useNavigate()
  const { data: product, isLoading } = useProduct(id)
  const { data: related } = useRelatedProducts(id)
  const { data: allPlanters, isLoading: plantersLoading } = usePlanters("planter")

  const addItem = useCartStore((s) => s.addItem)
  const isAuthenticated = useAuthStore((s) => Boolean(s.token))
  const isFavorite = useWishlistStore((s) => s.has(id))
  const toggleWishlist = useToggleWishlist()

  const [planterChoice, setPlanterChoice] = useState("none")
  const [quantity, setQuantity] = useState(1)

  const planterOptions = useMemo(() => {
    if (!product?.planterOptions || !allPlanters) return []
    const optionIds = product.planterOptions.map(String)
    return allPlanters.filter((p) => optionIds.includes(p.id))
  }, [product, allPlanters])

  const selectedPlanter = planterOptions.find((p) => p.id === planterChoice)
  const unitPrice = (product?.price ?? 0) + (selectedPlanter?.price ?? 0)
  const maxQuantity = useMemo(() => {
    if (!product) return 0
    const productMax = getMaxOrderQuantity(product.stockQuantity, product.inStock)
    if (!selectedPlanter) return productMax
    const planterMax = getMaxOrderQuantity(selectedPlanter.stockQuantity, selectedPlanter.inStock)
    return Math.min(productMax, planterMax)
  }, [product, selectedPlanter])
  const canPurchase = maxQuantity > 0

  useEffect(() => {
    setQuantity((current) => clampOrderQuantity(current, maxQuantity))
  }, [maxQuantity])

  const buildCartItem = () => {
    if (!product) return null
    const cartId = encodeCartId({
      kind: "product",
      productId: product.id,
      planterId: selectedPlanter?.id,
    })
    return {
      id: cartId,
      title: product.title,
      price: unitPrice,
      image: product.imageUrl,
      planter: selectedPlanter ? `Có (Kèm ${selectedPlanter.name})` : "Không",
      maxQuantity,
    }
  }

  const handleAddToCart = () => {
    const item = buildCartItem()
    if (!item) return
    addItem(item, quantity)
    toast.success("Đã thêm vào giỏ hàng", { description: product?.title })
  }

  const handleBuyNow = () => {
    const item = buildCartItem()
    if (!item) return
    addItem(item, quantity)
    navigate("/checkout")
  }

  const handleWishlist = () => {
    if (!isAuthenticated) {
      toast.info("Vui lòng đăng nhập để lưu yêu thích")
      navigate("/signin")
      return
    }
    toggleWishlist.mutate(id)
  }

  if (isLoading) {
    return (
      <div className="mx-auto grid max-w-7xl gap-10 px-4 py-8 lg:grid-cols-2">
        <Skeleton className="aspect-square rounded-2xl" />
        <div className="space-y-4">
          <Skeleton className="h-8 w-3/4" />
          <Skeleton className="h-6 w-1/3" />
          <Skeleton className="h-24 w-full" />
        </div>
      </div>
    )
  }

  if (!product) {
    return (
      <div className="mx-auto max-w-2xl px-4 py-24 text-center">
        <p className="text-muted-foreground">Không tìm thấy sản phẩm.</p>
        <Button asChild className="mt-4">
          <Link to="/shop">Về cửa hàng</Link>
        </Button>
      </div>
    )
  }

  return (
    <div className="mx-auto max-w-7xl px-4 py-8">
      <div className="grid gap-10 lg:grid-cols-2">
        <ProductGallery images={product.images} title={product.title} />

        <div className="space-y-5">
          <div>
            <Link
              to={`/shop?category=${encodeURIComponent(product.category)}`}
              className="text-sm uppercase tracking-wide text-muted-foreground hover:text-primary"
            >
              {product.category}
            </Link>
            <h1 className="mt-1 text-3xl font-semibold">{product.title}</h1>
          </div>

          <div className="flex items-center gap-3">
            <Price value={unitPrice} originalValue={product.originalPrice} size="lg" />
            {product.discount && (
              <Badge className="bg-accent text-accent-foreground">-{product.discount}</Badge>
            )}
            {!canPurchase && <Badge variant="secondary">Hết hàng</Badge>}
          </div>

          <p className="text-sm text-muted-foreground">
            {formatStockLabel(product.stockQuantity, product.inStock)}
            {selectedPlanter
              ? ` · Chậu kèm: ${formatStockLabel(selectedPlanter.stockQuantity, selectedPlanter.inStock)}`
              : ""}
          </p>

          {product.description && (
            <p className="text-muted-foreground">{product.description}</p>
          )}

          {planterOptions.length > 0 && (
            <PlanterAddOnSelector
              options={planterOptions}
              isLoading={plantersLoading}
              value={planterChoice}
              onChange={setPlanterChoice}
            />
          )}

          {/* Quantity + actions */}
          <div className="flex flex-wrap items-center gap-3 pt-2">
            <div className="flex items-center rounded-lg border border-border">
              <Button
                variant="ghost"
                size="icon"
                onClick={() => setQuantity((q) => Math.max(1, q - 1))}
              >
                <Minus className="size-4" />
              </Button>
              <span className="w-10 text-center">{quantity}</span>
              <Button
                variant="ghost"
                size="icon"
                disabled={quantity >= maxQuantity}
                onClick={() => setQuantity((q) => clampOrderQuantity(q + 1, maxQuantity))}
              >
                <Plus className="size-4" />
              </Button>
            </div>

            <Button onClick={handleAddToCart} disabled={!canPurchase} className="flex-1 sm:flex-none">
              <ShoppingBag className="size-4" /> Thêm vào giỏ
            </Button>
            <Button
              variant="secondary"
              onClick={handleBuyNow}
              disabled={!canPurchase}
              className="flex-1 sm:flex-none"
            >
              Mua ngay
            </Button>
            <Button
              variant="outline"
              size="icon"
              onClick={handleWishlist}
              aria-label="Yêu thích"
            >
              <Heart className={cn("size-4", isFavorite && "fill-accent text-accent")} />
            </Button>
          </div>

          <div className="flex items-center gap-2 text-sm text-muted-foreground">
            <Truck className="size-4" /> Giao nhanh, đóng gói an toàn cho cây
          </div>

          <Separator />

          {/* Care guide + bio */}
          <Accordion type="multiple" className="w-full">
            {product.bio && (
              <AccordionItem value="bio">
                <AccordionTrigger>Giới thiệu</AccordionTrigger>
                <AccordionContent className="whitespace-pre-line text-muted-foreground">
                  {product.bio}
                </AccordionContent>
              </AccordionItem>
            )}
            {product.careGuide?.map((guide, i) => (
              <AccordionItem key={i} value={`care-${i}`}>
                <AccordionTrigger className="gap-2">
                  <span className="flex items-center gap-2">
                    <Leaf className="size-4 text-primary" /> {guide.title}
                  </span>
                </AccordionTrigger>
                <AccordionContent className="whitespace-pre-line text-muted-foreground">
                  {guide.content}
                </AccordionContent>
              </AccordionItem>
            ))}
          </Accordion>
        </div>
      </div>

      {/* Reviews */}
      <div className="mt-16">
        <ReviewsSection productId={product.id} />
      </div>

      {/* Related */}
      {related && related.length > 0 && (
        <div className="mt-16">
          <h2 className="mb-6 text-2xl font-semibold">Sản phẩm liên quan</h2>
          <div className="grid grid-cols-2 gap-4 sm:grid-cols-3 lg:grid-cols-4">
            {related.map((p) => (
              <ProductCard key={p.id} product={p} />
            ))}
          </div>
        </div>
      )}

      <p className="sr-only">{formatVND(unitPrice)}</p>
    </div>
  )
}
