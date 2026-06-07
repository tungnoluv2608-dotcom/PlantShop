import { Link, useParams } from "react-router"
import { CheckCircle2 } from "lucide-react"
import { Button } from "@/components/ui/button"
import { Card, CardContent } from "@/components/ui/card"
import { Separator } from "@/components/ui/separator"
import { formatVND } from "@/lib/format"
import { useOrder } from "../api"
import { OrderItemsList } from "../components/OrderItemsList"

export function OrderSuccessPage() {
  const { orderId = "" } = useParams()
  const { data: order } = useOrder(orderId)

  return (
    <div className="mx-auto max-w-2xl px-4 py-16">
      <div className="flex flex-col items-center gap-4 text-center">
        <CheckCircle2 className="size-16 text-primary" />
        <h1 className="text-3xl font-semibold">Đặt hàng thành công!</h1>
        <p className="text-muted-foreground">
          Cảm ơn bạn. Mã đơn hàng của bạn là{" "}
          <span className="font-medium text-foreground">{orderId}</span>.
        </p>
      </div>

      {order && (
        <Card className="mt-8">
          <CardContent className="space-y-4 pt-6">
            <OrderItemsList items={order.items} />
            <Separator />
            <div className="space-y-1 text-sm">
              <div className="flex justify-between">
                <span className="text-muted-foreground">Tạm tính</span>
                <span>{formatVND(order.subtotal)}</span>
              </div>
              <div className="flex justify-between">
                <span className="text-muted-foreground">Phí vận chuyển</span>
                <span>{formatVND(order.shippingFee)}</span>
              </div>
              <div className="flex justify-between text-base font-semibold">
                <span>Tổng cộng</span>
                <span>{formatVND(order.total)}</span>
              </div>
            </div>
          </CardContent>
        </Card>
      )}

      <div className="mt-8 flex justify-center gap-3">
        <Button asChild>
          <Link to={`/orders/${orderId}`}>Xem chi tiết đơn</Link>
        </Button>
        <Button asChild variant="outline">
          <Link to="/shop">Tiếp tục mua sắm</Link>
        </Button>
      </div>
    </div>
  )
}
