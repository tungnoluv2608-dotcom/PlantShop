import { CreditCard } from "lucide-react"
import { toast } from "sonner"
import type { Order } from "@/types"
import { Button } from "@/components/ui/button"
import { getApiErrorMessage } from "@/lib/api-client"
import { useRetryOrderPayment } from "../api"

const RETRY_LABELS: Record<string, string> = {
  payos: "Tiếp tục thanh toán PayOS",
  vnpay: "Tiếp tục thanh toán VNPay",
}

export function isOrderAwaitingOnlinePayment(order: Pick<Order, "status" | "paymentMethod">) {
  const method = order.paymentMethod.toLowerCase()
  return order.status === "pending" && (method === "payos" || method === "vnpay")
}

interface OrderPendingPaymentActionsProps {
  order: Pick<Order, "id" | "status" | "paymentMethod" | "recipientPhone">
  className?: string
  size?: "default" | "sm" | "lg"
}

export function OrderPendingPaymentActions({
  order,
  className,
  size = "default",
}: OrderPendingPaymentActionsProps) {
  const retryPayment = useRetryOrderPayment()

  if (!isOrderAwaitingOnlinePayment(order)) return null

  const method = order.paymentMethod.toLowerCase()
  const label = RETRY_LABELS[method] ?? "Tiếp tục thanh toán"

  const handleRetry = () => {
    retryPayment.mutate(
      {
        orderId: order.id,
        paymentMethod: order.paymentMethod,
        buyerPhone: order.recipientPhone ?? undefined,
      },
      { onError: (err) => toast.error(getApiErrorMessage(err)) },
    )
  }

  return (
    <Button className={className} size={size} onClick={handleRetry} disabled={retryPayment.isPending}>
      <CreditCard className="size-4" />
      {retryPayment.isPending ? "Đang chuyển..." : label}
    </Button>
  )
}