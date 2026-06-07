import { Link } from "react-router"
import { ShoppingBag } from "lucide-react"
import { toast } from "sonner"
import type { Planter } from "@/types"
import { Badge } from "@/components/ui/badge"
import { Button } from "@/components/ui/button"
import { Price } from "@/components/common/Price"
import { useCartStore } from "@/stores/cartStore"
import { encodeCartId } from "@/lib/cart-id"

export function PlanterCard({ planter }: { planter: Planter }) {
  const addItem = useCartStore((s) => s.addItem)
  const basePath = planter.type === "accessory" ? "/accessories" : "/planters"

  const handleAdd = (e: React.MouseEvent) => {
    e.preventDefault()
    addItem({
      id: encodeCartId(
        planter.type === "accessory"
          ? { kind: "accessory", accessoryId: planter.id }
          : { kind: "planter", planterId: planter.id },
      ),
      title: planter.name,
      price: planter.price,
      image: planter.imageUrl,
      planter: "Không",
    })
    toast.success("Đã thêm vào giỏ hàng", { description: planter.name })
  }

  return (
    <Link
      to={`${basePath}/${planter.id}`}
      className="group flex flex-col overflow-hidden rounded-xl border border-border bg-card transition-shadow hover:shadow-lg"
    >
      <div className="relative aspect-square overflow-hidden bg-muted">
        <img
          src={planter.imageUrl}
          alt={planter.name}
          loading="lazy"
          className="size-full object-cover transition-transform duration-500 group-hover:scale-105"
        />
        {!planter.inStock && (
          <Badge variant="secondary" className="absolute right-3 top-3">
            Hết hàng
          </Badge>
        )}
      </div>
      <div className="flex flex-1 flex-col gap-2 p-4">
        <span className="text-xs uppercase tracking-wide text-muted-foreground">
          {planter.material}
        </span>
        <h3 className="line-clamp-2 font-medium leading-snug">{planter.name}</h3>
        <div className="mt-auto flex items-center justify-between gap-2 pt-2">
          <Price value={planter.price} />
          <Button size="icon" variant="secondary" onClick={handleAdd} aria-label="Thêm vào giỏ">
            <ShoppingBag className="size-4" />
          </Button>
        </div>
      </div>
    </Link>
  )
}
