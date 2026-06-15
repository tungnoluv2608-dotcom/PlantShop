import { useEffect, useRef, useState } from "react"
import { useSearchParams } from "react-router"
import { toast } from "sonner"
import { getApiErrorMessage } from "@/lib/api-client"
import { useCancelOrder } from "@/features/orders/api"
import { PaymentStatusView } from "../components/PaymentStatusView"

export function PayosCancelPage() {
  const [params] = useSearchParams()
  const orderId = params.get("orderId") ?? undefined
  const { mutate: cancelOrder } = useCancelOrder()
  const handled = useRef(false)
  const [cancelFailed, setCancelFailed] = useState(false)
  const [errorDetail, setErrorDetail] = useState<string>()

  useEffect(() => {
    if (handled.current) return
    handled.current = true

    if (!orderId) {
      setCancelFailed(true)
      setErrorDetail("Không tìm thấy mã đơn hàng.")
      return
    }

    cancelOrder(orderId, {
      onError: (err) => {
        setCancelFailed(true)
        setErrorDetail(getApiErrorMessage(err))
        toast.error(getApiErrorMessage(err))
      },
    })
  }, [orderId, cancelOrder])

  if (!orderId || cancelFailed) {
    return (
      <PaymentStatusView
        status="failed"
        title="Đã hủy thanh toán"
        message={
          errorDetail ??
          "Thanh toán PayOS đã bị hủy. Vui lòng kiểm tra đơn hàng trong tài khoản hoặc liên hệ hỗ trợ."
        }
        orderId={orderId}
      />
    )
  }

  return (
    <PaymentStatusView
      status="failed"
      title="Đã hủy thanh toán"
      message="Bạn đã hủy giao dịch PayOS. Đơn hàng cũng đã được hủy — bạn có thể đặt lại khi cần."
      orderId={orderId}
    />
  )
}