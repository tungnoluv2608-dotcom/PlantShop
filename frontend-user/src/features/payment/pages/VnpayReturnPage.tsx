import { useEffect, useState } from "react"
import { useLocation } from "react-router"
import type { PaymentVerifyResult } from "@/types"
import { verifyVnpay } from "@/features/orders/api"
import { getApiErrorMessage } from "@/lib/api-client"
import { PaymentStatusView } from "../components/PaymentStatusView"

export function VnpayReturnPage() {
  const location = useLocation()
  const [result, setResult] = useState<PaymentVerifyResult | null>(null)
  const [error, setError] = useState<string | null>(null)

  useEffect(() => {
    verifyVnpay(location.search)
      .then(setResult)
      .catch((err) => setError(getApiErrorMessage(err)))
  }, [location.search])

  if (error) {
    return <PaymentStatusView status="failed" title="Xác thực thất bại" message={error} />
  }
  if (!result) {
    return <PaymentStatusView status="loading" title="Đang xác thực thanh toán..." />
  }
  return (
    <PaymentStatusView
      status={result.success ? "success" : "failed"}
      title={result.success ? "Thanh toán thành công" : "Thanh toán thất bại"}
      message={result.message}
      orderId={result.orderId}
    />
  )
}
