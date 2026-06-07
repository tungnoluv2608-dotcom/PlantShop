import type { OrderStatus } from "@/types"
import { Badge } from "@/components/ui/badge"
import { cn } from "@/lib/utils"

const STATUS_MAP: Record<OrderStatus, { label: string; className: string }> = {
  pending: { label: "Chờ xác nhận", className: "bg-amber-100 text-amber-800" },
  confirmed: { label: "Đã xác nhận", className: "bg-blue-100 text-blue-800" },
  packing: { label: "Đang đóng gói", className: "bg-indigo-100 text-indigo-800" },
  shipping: { label: "Đang giao", className: "bg-cyan-100 text-cyan-800" },
  delivered: { label: "Đã giao", className: "bg-primary/15 text-primary" },
  cancelled: { label: "Đã hủy", className: "bg-destructive/15 text-destructive" },
  returning: { label: "Đang hoàn trả", className: "bg-orange-100 text-orange-800" },
}

export function OrderStatusBadge({ status }: { status: OrderStatus }) {
  const config = STATUS_MAP[status] ?? STATUS_MAP.pending
  return <Badge className={cn("border-transparent", config.className)}>{config.label}</Badge>
}
