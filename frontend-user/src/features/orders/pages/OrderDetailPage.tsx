import { useParams, Link } from "react-router"
import { ExternalLink, Truck } from "lucide-react"
import { toast } from "sonner"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Separator } from "@/components/ui/separator"
import { Skeleton } from "@/components/ui/skeleton"
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
  AlertDialogTrigger,
} from "@/components/ui/alert-dialog"
import { formatVND, formatDate } from "@/lib/format"
import { getApiErrorMessage } from "@/lib/api-client"
import { useOrder, useCancelOrder } from "../api"
import { OrderStatusBadge } from "../components/OrderStatusBadge"
import { OrderTimeline } from "../components/OrderTimeline"
import { OrderItemsList } from "../components/OrderItemsList"

const CANCELABLE = new Set(["pending", "confirmed"])

export function OrderDetailPage() {
  const { id = "" } = useParams()
  const { data: order, isLoading } = useOrder(id)
  const cancelOrder = useCancelOrder()

  if (isLoading) {
    return (
      <div className="mx-auto max-w-4xl space-y-4 px-4 py-8">
        <Skeleton className="h-8 w-1/3" />
        <Skeleton className="h-40 w-full" />
      </div>
    )
  }
  if (!order) {
    return (
      <div className="mx-auto max-w-2xl px-4 py-24 text-center">
        <p className="text-muted-foreground">Không tìm thấy đơn hàng.</p>
        <Button asChild className="mt-4">
          <Link to="/profile?tab=orders">Đơn hàng của tôi</Link>
        </Button>
      </div>
    )
  }

  const handleCancel = () => {
    cancelOrder.mutate(order.id, {
      onSuccess: (data) => toast.success(data.message),
      onError: (err) => toast.error(getApiErrorMessage(err)),
    })
  }

  return (
    <div className="mx-auto max-w-4xl px-4 py-8">
      <div className="mb-6 flex flex-wrap items-center justify-between gap-3">
        <div>
          <h1 className="text-2xl font-semibold">Đơn hàng {order.id}</h1>
          <p className="text-sm text-muted-foreground">Đặt ngày {formatDate(order.date)}</p>
        </div>
        <div className="flex items-center gap-3">
          <OrderStatusBadge status={order.status} />
          {CANCELABLE.has(order.status) && (
            <AlertDialog>
              <AlertDialogTrigger asChild>
                <Button variant="outline" size="sm">
                  Hủy đơn
                </Button>
              </AlertDialogTrigger>
              <AlertDialogContent>
                <AlertDialogHeader>
                  <AlertDialogTitle>Hủy đơn hàng?</AlertDialogTitle>
                  <AlertDialogDescription>
                    Hành động này không thể hoàn tác.
                  </AlertDialogDescription>
                </AlertDialogHeader>
                <AlertDialogFooter>
                  <AlertDialogCancel>Không</AlertDialogCancel>
                  <AlertDialogAction onClick={handleCancel}>Hủy đơn</AlertDialogAction>
                </AlertDialogFooter>
              </AlertDialogContent>
            </AlertDialog>
          )}
        </div>
      </div>

      <div className="grid gap-6 lg:grid-cols-[1fr_320px]">
        <div className="space-y-6">
          <Card>
            <CardHeader>
              <CardTitle className="text-lg">Sản phẩm</CardTitle>
            </CardHeader>
            <CardContent>
              <OrderItemsList items={order.items} />
            </CardContent>
          </Card>

          {order.timeline.length > 0 && (
            <Card>
              <CardHeader>
                <CardTitle className="text-lg">Trạng thái đơn hàng</CardTitle>
              </CardHeader>
              <CardContent>
                <OrderTimeline timeline={order.timeline} />
              </CardContent>
            </Card>
          )}
        </div>

        <div className="space-y-6">
          <Card>
            <CardHeader>
              <CardTitle className="text-lg">Thanh toán</CardTitle>
            </CardHeader>
            <CardContent className="space-y-2 text-sm">
              <div className="flex justify-between">
                <span className="text-muted-foreground">Tạm tính</span>
                <span>{formatVND(order.subtotal)}</span>
              </div>
              <div className="flex justify-between">
                <span className="text-muted-foreground">Phí vận chuyển</span>
                <span>{formatVND(order.shippingFee)}</span>
              </div>
              <Separator />
              <div className="flex justify-between text-base font-semibold">
                <span>Tổng cộng</span>
                <span>{formatVND(order.total)}</span>
              </div>
              <p className="pt-2 text-muted-foreground">
                Phương thức: {order.paymentMethod.toUpperCase()}
              </p>
            </CardContent>
          </Card>

          <Card>
            <CardHeader>
              <CardTitle className="text-lg">Giao hàng</CardTitle>
            </CardHeader>
            <CardContent className="space-y-3 text-sm">
              <p className="text-muted-foreground">{order.shippingAddress}</p>
              {order.trackingNumber && (
                <div className="flex items-center gap-2">
                  <Truck className="size-4" />
                  <span>{order.trackingNumber}</span>
                </div>
              )}
              {order.trackingUrl && (
                <Button asChild variant="outline" size="sm">
                  <a href={order.trackingUrl} target="_blank" rel="noopener noreferrer">
                    Theo dõi vận đơn <ExternalLink className="size-3.5" />
                  </a>
                </Button>
              )}
            </CardContent>
          </Card>
        </div>
      </div>
    </div>
  )
}
