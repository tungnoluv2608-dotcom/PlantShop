import type { OrderItem } from "@/types"
import { formatVND } from "@/lib/format"

export function OrderItemsList({ items }: { items: OrderItem[] }) {
  return (
    <div className="divide-y divide-border">
      {items.map((item, i) => (
        <div key={`${item.id}-${i}`} className="flex gap-3 py-3">
          <img src={item.image} alt={item.title} className="size-14 rounded-md object-cover" />
          <div className="flex-1 text-sm">
            <p className="font-medium">{item.title}</p>
            {item.planter && item.planter !== "Không" && (
              <p className="text-muted-foreground">{item.planter}</p>
            )}
            <p className="text-muted-foreground">x{item.quantity}</p>
          </div>
          <span className="text-sm font-medium">{formatVND(item.price * item.quantity)}</span>
        </div>
      ))}
    </div>
  )
}
