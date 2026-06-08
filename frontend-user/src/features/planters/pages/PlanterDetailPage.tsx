import { useParams, Link } from "react-router"
import { ShoppingBag, Tag } from "lucide-react"
import { toast } from "sonner"
import type { PlanterType } from "@/types"
import { Button } from "@/components/ui/button"
import { Badge } from "@/components/ui/badge"
import { Separator } from "@/components/ui/separator"
import { Skeleton } from "@/components/ui/skeleton"
import { Price } from "@/components/common/Price"
import { encodeCartId } from "@/lib/cart-id"
import { useCartStore } from "@/stores/cartStore"
import { usePlanter } from "../api"
import { formatStockLabel, getMaxOrderQuantity } from "@/lib/stock"

export function PlanterDetailPage({ type }: { type: PlanterType }) {
  const { id = "" } = useParams()
  const { data: item, isLoading } = usePlanter(id, type)
  const addItem = useCartStore((s) => s.addItem)

  const maxQuantity = item ? getMaxOrderQuantity(item.stockQuantity, item.inStock) : 0

  const handleAdd = () => {
    if (!item || maxQuantity <= 0) return
    addItem({
      id: encodeCartId(
        type === "accessory"
          ? { kind: "accessory", accessoryId: item.id }
          : { kind: "planter", planterId: item.id },
      ),
      title: item.name,
      price: item.price,
      image: item.imageUrl,
      planter: "Không",
      maxQuantity,
    })
    toast.success("Đã thêm vào giỏ hàng", { description: item.name })
  }

  if (isLoading) {
    return (
      <div className="mx-auto grid max-w-6xl gap-10 px-4 py-8 lg:grid-cols-2">
        <Skeleton className="aspect-square rounded-2xl" />
        <div className="space-y-4">
          <Skeleton className="h-8 w-3/4" />
          <Skeleton className="h-6 w-1/3" />
        </div>
      </div>
    )
  }

  if (!item) {
    return (
      <div className="mx-auto max-w-2xl px-4 py-24 text-center">
        <p className="text-muted-foreground">Không tìm thấy sản phẩm.</p>
        <Button asChild className="mt-4">
          <Link to={type === "accessory" ? "/accessories" : "/planters"}>Quay lại</Link>
        </Button>
      </div>
    )
  }

  return (
    <div className="mx-auto max-w-6xl px-4 py-8">
      <div className="grid gap-10 lg:grid-cols-2">
        <div className="aspect-square overflow-hidden rounded-2xl border border-border bg-muted">
          <img src={item.imageUrl} alt={item.name} className="size-full object-cover" />
        </div>

        <div className="space-y-5">
          <div>
            <span className="text-sm uppercase tracking-wide text-muted-foreground">
              {item.material}
            </span>
            <h1 className="mt-1 text-3xl font-semibold">{item.name}</h1>
          </div>

          <div className="flex items-center gap-3">
            <Price value={item.price} size="lg" />
            {maxQuantity <= 0 && <Badge variant="secondary">Hết hàng</Badge>}
          </div>

          <p className="text-sm text-muted-foreground">
            {formatStockLabel(item.stockQuantity, item.inStock)}
          </p>

          {item.accessoryBrand && (
            <p className="text-sm text-muted-foreground">Thương hiệu: {item.accessoryBrand}</p>
          )}

          {item.sizes.length > 0 && (
            <div className="space-y-2">
              <span className="text-sm font-medium">Kích thước</span>
              <div className="flex flex-wrap gap-2">
                {item.sizes.map((size) => (
                  <Badge key={size} variant="outline">
                    {size}
                  </Badge>
                ))}
              </div>
            </div>
          )}

          {item.usageTags && item.usageTags.length > 0 && (
            <div className="flex flex-wrap gap-1.5">
              {item.usageTags.map((tag) => (
                <Badge key={tag} variant="secondary" className="gap-1">
                  <Tag className="size-3" /> {tag}
                </Badge>
              ))}
            </div>
          )}

          <Separator />

          <Button onClick={handleAdd} disabled={maxQuantity <= 0} size="lg">
            <ShoppingBag className="size-4" /> Thêm vào giỏ
          </Button>
        </div>
      </div>
    </div>
  )
}
