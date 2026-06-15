import { Link } from "react-router"
import { CheckCircle2, XCircle, Loader2, Clock } from "lucide-react"
import { Button } from "@/components/ui/button"

type Status = "loading" | "success" | "failed" | "pending"

interface PaymentStatusViewProps {
  status: Status
  title: string
  message?: string
  orderId?: string
  onRetryPayment?: () => void
  retryLabel?: string
  isRetrying?: boolean
}

const ICONS = {
  loading: <Loader2 className="size-14 animate-spin text-primary" />,
  success: <CheckCircle2 className="size-14 text-primary" />,
  failed: <XCircle className="size-14 text-destructive" />,
  pending: <Clock className="size-14 text-accent" />,
} as const

export function PaymentStatusView({
  status,
  title,
  message,
  orderId,
  onRetryPayment,
  retryLabel = "Thanh toán lại",
  isRetrying = false,
}: PaymentStatusViewProps) {
  return (
    <div className="mx-auto flex max-w-md flex-col items-center gap-5 px-4 py-24 text-center">
      {ICONS[status]}
      <div className="space-y-2">
        <h1 className="text-2xl font-semibold">{title}</h1>
        {message && <p className="text-muted-foreground">{message}</p>}
        {orderId && (
          <p className="text-sm text-muted-foreground">
            Mã đơn hàng: <span className="font-medium text-foreground">{orderId}</span>
          </p>
        )}
      </div>
      {status !== "loading" && (
        <div className="flex flex-wrap justify-center gap-3">
          {onRetryPayment && (
            <Button onClick={onRetryPayment} disabled={isRetrying}>
              {isRetrying ? "Đang chuyển..." : retryLabel}
            </Button>
          )}
          {orderId && (
            <Button asChild variant={onRetryPayment ? "outline" : "default"}>
              <Link to={`/orders/${orderId}`}>Xem đơn hàng</Link>
            </Button>
          )}
          <Button asChild variant="outline">
            <Link to="/shop">Tiếp tục mua sắm</Link>
          </Button>
        </div>
      )}
    </div>
  )
}
