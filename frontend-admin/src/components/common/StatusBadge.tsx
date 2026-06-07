import { Badge } from "@/components/ui/badge"
import { cn } from "@/lib/utils"
import type { OrderStatus, WholesaleStatus } from "@/types"

const ORDER_STATUS: Record<OrderStatus, { label: string; className: string }> = {
  pending: { label: "Chờ xử lý", className: "bg-amber-100 text-amber-800 border-amber-200" },
  confirmed: { label: "Đã xác nhận", className: "bg-blue-100 text-blue-800 border-blue-200" },
  packing: { label: "Đang đóng gói", className: "bg-indigo-100 text-indigo-800 border-indigo-200" },
  shipping: { label: "Đang giao", className: "bg-violet-100 text-violet-800 border-violet-200" },
  delivered: { label: "Đã giao", className: "bg-emerald-100 text-emerald-800 border-emerald-200" },
  cancelled: { label: "Đã hủy", className: "bg-rose-100 text-rose-800 border-rose-200" },
  returning: { label: "Đang hoàn", className: "bg-orange-100 text-orange-800 border-orange-200" },
}

const WHOLESALE_STATUS: Record<WholesaleStatus, { label: string; className: string }> = {
  new: { label: "Mới", className: "bg-sky-100 text-sky-800 border-sky-200" },
  contacted: { label: "Đã liên hệ", className: "bg-blue-100 text-blue-800 border-blue-200" },
  qualified: { label: "Tiềm năng", className: "bg-indigo-100 text-indigo-800 border-indigo-200" },
  quoted: { label: "Đã báo giá", className: "bg-violet-100 text-violet-800 border-violet-200" },
  won: { label: "Thành công", className: "bg-emerald-100 text-emerald-800 border-emerald-200" },
  lost: { label: "Thất bại", className: "bg-rose-100 text-rose-800 border-rose-200" },
  archived: { label: "Lưu trữ", className: "bg-muted text-muted-foreground border-border" },
}

export function OrderStatusBadge({ status }: { status: OrderStatus }) {
  const meta = ORDER_STATUS[status] ?? {
    label: status,
    className: "bg-muted text-muted-foreground",
  }
  return (
    <Badge variant="outline" className={cn("font-medium", meta.className)}>
      {meta.label}
    </Badge>
  )
}

export function WholesaleStatusBadge({ status }: { status: WholesaleStatus }) {
  const meta = WHOLESALE_STATUS[status] ?? {
    label: status,
    className: "bg-muted text-muted-foreground",
  }
  return (
    <Badge variant="outline" className={cn("font-medium", meta.className)}>
      {meta.label}
    </Badge>
  )
}

export { ORDER_STATUS, WHOLESALE_STATUS }
