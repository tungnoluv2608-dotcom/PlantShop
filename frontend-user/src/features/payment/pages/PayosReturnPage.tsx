import { useEffect, useState } from "react"
import { useSearchParams } from "react-router"
import type { PaymentVerifyResult } from "@/types"
import { verifyPayos } from "@/features/orders/api"
import { getApiErrorMessage } from "@/lib/api-client"
import { PaymentStatusView } from "../components/PaymentStatusView"

export function PayosReturnPage() {
  const [params] = useSearchParams()
  const [result, setResult] = useState<PaymentVerifyResult | null>(null)
  const [error, setError] = useState<string | null>(null)

  useEffect(() => {
    verifyPayos({
      id: params.get("id") ?? undefined,
      orderCode: params.get("orderCode") ?? undefined,
    })
      .then(setResult)
      .catch((err) => setError(getApiErrorMessage(err)))
  }, [params])

  if (error) {
    return <PaymentStatusView status="failed" title="Xác thực thất bại" message={error} />
  }
  if (!result) {
    return <PaymentStatusView status="loading" title="Đang xác thực thanh toán..." />
  }
  return (
    <PaymentStatusView
      status={result.success ? "success" : "pending"}
      title={result.success ? "Thanh toán thành công" : "Thanh toán chưa hoàn tất"}
      message={result.message ?? (result.status ? `Trạng thái: ${result.status}` : undefined)}
      orderId={result.orderId}
    />
  )
}
