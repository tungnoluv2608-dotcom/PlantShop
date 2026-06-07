import { useSearchParams } from "react-router"
import { PaymentStatusView } from "../components/PaymentStatusView"

export function PayosCancelPage() {
  const [params] = useSearchParams()
  return (
    <PaymentStatusView
      status="failed"
      title="Đã hủy thanh toán"
      message="Bạn đã hủy giao dịch PayOS. Đơn hàng vẫn được giữ, bạn có thể thanh toán lại."
      orderId={params.get("orderId") ?? undefined}
    />
  )
}
